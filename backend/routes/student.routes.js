/**
 * Student Routes
 * Handles student-specific operations
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const supabase = require('../config/supabase');
const { studentOnly, staffOnly, authenticate, requireOwnership } = require('../middleware/auth.middleware');
const { asyncHandler, AppError } = require('../middleware/error.middleware');
const { upload } = require('../config/cloudinary');

// Validation helper
const validate = (req, res, next) => {
  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Apply authentication to all routes in this router
router.use(authenticate);

/**
 * @route   GET /api/students
 * @desc    Get all students (Admin/Staff only)
 * @access  Private
 */
router.get('/',
  staffOnly,
  asyncHandler(async (req, res) => {
    const { department, batch, search, page = 1, limit = 20 } = req.query;
    
    let queryBuilder = supabase
      .from('student_profiles')
      .select('*, department:department_id(name, code)', { count: 'exact' });
    
    if (department) queryBuilder = queryBuilder.eq('department_id', department);
    if (batch) queryBuilder = queryBuilder.eq('batch', batch);
    if (search) {
      queryBuilder = queryBuilder.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,registration_number.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    const { data: students, count, error } = await queryBuilder
      .order('registration_number', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) throw error;

    res.status(200).json({
      success: true,
      data: students
    });
  })
);

/**
 * @route   GET /api/students/profile
 * @desc    Get student profile
 * @access  Student
 */
router.get('/profile',
  studentOnly,
  asyncHandler(async (req, res) => {
    const { data: student, error } = await supabase
      .from('student_profiles')
      .select('*, department:department_id(name, code, contact_info, clearance_config)')
      .eq('id', req.user.id)
      .single();
    
    if (!student || error) {
      throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    }
    
    const { password, ...studentData } = student;
    
    res.status(200).json({
      success: true,
      data: { student: studentData }
    });
  })
);

/**
 * @route   PUT /api/students/profile
 * @desc    Update student profile
 * @access  Student
 */
router.put('/profile',
  studentOnly,
  [
    body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number'),
    body('address').optional().isObject(),
    validate
  ],
  asyncHandler(async (req, res) => {
    const allowedUpdates = [
      'phone', 'avatar_url', 'first_name', 'last_name', 'email', 
      'registration_number', 'department_id', 'program', 'discipline', 'batch'
    ];
    
    const updates = {};
    
    // Map frontend camelCase to snake_case if present
    const body = { ...req.body };
    if (body.firstName) body.first_name = body.firstName;
    if (body.lastName) body.last_name = body.lastName;
    if (body.registrationNumber) body.registration_number = body.registrationNumber.toUpperCase();
    if (body.departmentId) body.department_id = body.departmentId;
    if (body.avatar) body.avatar_url = body.avatar;
    if (body.phone !== undefined) {
      body.phone_number = body.phone;
    }

    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    const { data: student, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select('*, department:department_id(name, code)')
      .single();

    if (error) throw error;
    
    const { password, ...studentData } = student;
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { student: studentData }
    });
  })
);

/**
 * @route   GET /api/students/dashboard
 * @desc    Get student dashboard data
 * @access  Student
 */
router.get('/dashboard',
  studentOnly,
  asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    
    // Get student info
    const { data: student } = await supabase
      .from('student_profiles')
      .select('*, department:department_id(name, code)')
      .eq('id', studentId)
      .single();
    
    // Get active clearance request (no nested joins)
    const { data: activeRequests } = await supabase
      .from('clearance_requests')
      .select('*')
      .eq('student_id', studentId)
      .not('status', 'in', '("cancelled","cleared")')
      .order('created_at', { ascending: false });

    let activeRequest = activeRequests?.[0] || null;

    if (activeRequest) {
      // Fetch clearance statuses for this request
      const { data: statuses } = await supabase
        .from('clearance_status')
        .select('*')
        .eq('request_id', activeRequest.id)
        .order('created_at', { ascending: true });

      // Fetch department details for each status
      const deptIds = [...new Set((statuses || []).map(s => s.department_id).filter(Boolean))];
      const { data: depts } = await supabase
        .from('departments')
        .select('id, name, code, type, location, contact_info')
        .in('id', deptIds);

      activeRequest.clearance_status = (statuses || []).map(s => {
        const dept = depts?.find(d => d.id === s.department_id) || null;
        if (!dept) console.warn(`Mapping failed for dept_id: ${s.department_id} in request: ${activeRequest.id}`);
        return {
          ...s,
          department: dept
        };
      });
      console.log('Processed statuses:', activeRequest.clearance_status.length, 'Mapped depts:', activeRequest.clearance_status.filter(s => s.department).length);

      const totalDepartments = activeRequest.clearance_status.length;
      const clearedDepartments = activeRequest.clearance_status.filter(s => s.status === 'cleared').length;
      activeRequest.progress = {
        totalDepartments,
        clearedDepartments,
        percentage: totalDepartments === 0 ? 0 : Math.round((clearedDepartments / totalDepartments) * 100)
      };
    }

    // Get clearance history (flat, no joins)
    const { data: historyRaw } = await supabase
      .from('clearance_requests')
      .select('*')
      .eq('student_id', studentId)
      .in('status', ['cleared', 'cancelled', 'rejected'])
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Get all departments for clearance display (non-academic + student's own academic)
    const { data: allDepts } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('name');

    // Determine student's academic department from their profile
    const studentDeptId = student?.department_id;
    const departments = (allDepts || []).filter(d =>
      d.type !== 'academic' || d.id === studentDeptId
    );
    
    res.status(200).json({
      success: true,
      data: {
        student,
        activeRequest,
        clearanceHistory: historyRaw,
        departments,
        canSubmitNewRequest: !activeRequest || ['cleared', 'cancelled', 'rejected'].includes(activeRequest.status)
      }
    });
  })
);

/**
 * @route   GET /api/students/clearance-status
 * @desc    Get current clearance status
 * @access  Student
 */
router.get('/clearance-status',
  studentOnly,
  asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    
    const { data: requests } = await supabase
      .from('clearance_requests')
      .select(`
        *,
        clearance_status(
          *,
          department:department_id(name, code, type, contact_info),
          clearedBy:cleared_by(first_name, last_name)
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    const request = requests?.[0];
    
    if (!request) {
      return res.status(200).json({
        success: true,
        data: {
          hasActiveRequest: false,
          message: 'No clearance request found'
        }
      });
    }
    
    // Format department statuses for frontend
    const departmentStatuses = request.clearance_status.map(ds => ({
      department: ds.department,
      status: ds.status,
      remarks: ds.remarks,
      clearedBy: ds.clearedBy,
      clearedAt: ds.cleared_at,
      dueAmount: ds.due_amount,
      documentsRequired: ds.documents_required,
      checklistItems: ds.checklist_items,
      contactInfo: ds.department.contact_info,
      whatsappLink: `https://wa.me/${ds.department.whatsapp}`
    }));
    
    res.status(200).json({
      success: true,
      data: {
        hasActiveRequest: true,
        requestId: request.request_id,
        status: request.status,
        requestType: request.request_type,
        progress: request.progress,
        departmentStatuses,
        timeline: request.timeline || [],
        comments: (request.comments || []).filter(c => !c.is_internal),
        createdAt: request.created_at,
        updatedAt: request.updated_at,
        certificate: request.certificate
      }
    });
  })
);

/**
 * @route   POST /api/students/clearance-request
 * @desc    Submit new clearance request
 * @access  Student
 */
router.post('/clearance-request',
  studentOnly,
  [
    body('requestType')
      .isIn(['graduation', 'withdrawal', 'transfer', 'semester_end', 'custom'])
      .withMessage('Invalid request type'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const { requestType, reason, documents } = req.body;
    
    // Check if student already has an active request
    const { data: existingRequest } = await supabase
      .from('clearance_requests')
      .select('id')
      .eq('student_id', studentId)
      .not('status', 'in', '("cancelled", "cleared", "rejected")')
      .limit(1)
      .single();
    
    if (existingRequest) {
      throw new AppError(
        'You already have an active clearance request. Please wait for it to complete or cancel it.',
        400,
        'ACTIVE_REQUEST_EXISTS'
      );
    }
    
    // Get the student's own academic department
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('department_id')
      .eq('id', studentId)
      .single();

    // Get ALL non-academic departments + student's own academic department only
    const { data: allDepts } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true);

    const departments = (allDepts || []).filter(d =>
      d.type !== 'academic' || d.id === studentProfile?.department_id
    );
    
    // Generate request ID using Registration Number
    const { data: student } = await supabase.from('student_profiles').select('registration_number').eq('id', studentId).single();
    const regNum = student?.registration_number || Math.random().toString(36).substring(2, 6).toUpperCase();
    const requestId = `CLR-${regNum}`;

    // Create clearance request
    const { data: request, error: requestError } = await supabase
      .from('clearance_requests')
      .insert({
        student_id: studentId,
        request_id: requestId,
        request_type: requestType,
        reason: reason,
        status: 'submitted',
        progress: {
          totalDepartments: departments.length,
          clearedDepartments: 0,
          pendingDepartments: departments.length,
          rejectedDepartments: 0,
          percentage: 0
        },
        timeline: [{
          action: 'submitted',
          performedBy: studentId,
          performedByModel: 'Student',
          description: `Clearance request submitted by student. ${documents && documents.length > 0 ? documents.length + ' documents attached.' : ''}`,
          attachments: documents || [],
          timestamp: new Date().toISOString()
        }]
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // Create department statuses entries
    const statusEntries = departments.map(dept => ({
      request_id: request.id,
      department_id: dept.id,
      status: 'pending',
      documents_required: dept.clearance_config?.requiredDocuments?.map(doc => ({
        name: doc.name,
        submitted: false
      })) || [],
      checklist_items: dept.clearance_config?.checklist?.map(item => ({
        item: item.item,
        completed: false
      })) || []
    }));

    await supabase.from('clearance_status').insert(statusEntries);

    // Update student clearance status
    await supabase.from('student_profiles')
      .update({ clearance_status: 'in_progress' })
      .eq('id', studentId);
    
    res.status(201).json({
      success: true,
      message: 'Clearance request submitted successfully',
      data: {
        request: {
          ...request,
          departmentStatuses: statusEntries
        }
      }
    });
  })
);

/**
 * @route   POST /api/students/clearance-request/:id/cancel
 * @desc    Cancel clearance request
 * @access  Student
 */
router.post('/clearance-request/:id/cancel',
  studentOnly,
  [
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const studentId = req.user.id;
    
    const { data: request } = await supabase
      .from('clearance_requests')
      .select('*')
      .eq('id', id)
      .eq('student_id', studentId)
      .single();
    
    if (!request) {
      throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
    }
    
    if (['cleared', 'rejected'].includes(request.status)) {
      throw new AppError('Cannot cancel a completed request', 400, 'REQUEST_COMPLETED');
    }
    
    const timeline = request.timeline || [];
    timeline.push({
      action: 'cancelled',
      performedBy: studentId,
      performedByModel: 'Student',
      description: `Request cancelled: ${reason || 'Cancelled by student'}`,
      timestamp: new Date().toISOString()
    });

    await supabase.from('clearance_requests')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || 'Cancelled by student',
        timeline: timeline
      })
      .eq('id', id);
    
    // Update student clearance status
    await supabase.from('student_profiles')
      .update({ clearance_status: 'not_started' })
      .eq('id', studentId);
    
    res.status(200).json({
      success: true,
      message: 'Clearance request cancelled successfully'
    });
  })
);

/**
 * @route   POST /api/students/clearance-request/:id/documents
 * @desc    Upload documents for clearance request
 * @access  Student
 */
router.post('/clearance-request/:id/documents',
  studentOnly,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const studentId = req.user.id;
    
    // Use the upload middleware to get file URLs from Cloudinary
    upload.array('files')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'File upload failed', error: err.message });
      }

      const { data: request } = await supabase
        .from('clearance_requests')
        .select('*')
        .eq('id', id)
        .eq('student_id', studentId)
        .single();
      
      if (!request) {
        return res.status(404).json({ success: false, message: 'Clearance request not found' });
      }

      const files = req.files || [];
      const newDocuments = files.map(file => ({
        name: file.originalname,
        url: file.path, // Cloudinary URL
        type: file.mimetype,
        uploaded_at: new Date().toISOString()
      }));

      if (newDocuments.length > 0) {
        const timeline = request.timeline || [];
        timeline.push({
          action: 'documents_submitted',
          performedBy: studentId,
          performedByModel: 'Student',
          description: `${newDocuments.length} document(s) uploaded to Cloudinary`,
          attachments: newDocuments,
          timestamp: new Date().toISOString()
        });

        // Also add a comment to make it visible
        const comments = request.comments || [];
        comments.push({
          author: studentId,
          authorName: req.user.fullName,
          message: `Uploaded ${newDocuments.length} supporting documents.`,
          is_internal: false,
          attachments: newDocuments,
          created_at: new Date().toISOString()
        });

        await supabase.from('clearance_requests')
          .update({
            timeline: timeline,
            comments: comments
          })
          .eq('id', id);
      }

      res.status(200).json({
        success: true,
        message: 'Documents uploaded successfully',
        data: { documents: newDocuments }
      });
    });
  })
);

/**
 * @route   POST /api/students/clearance-request/:id/comments
 * @desc    Add comment to clearance request
 * @access  Student
 */
router.post('/clearance-request/:id/comments',
  studentOnly,
  [
    body('message')
      .trim()
      .notEmpty()
      .isLength({ max: 2000 })
      .withMessage('Message is required and cannot exceed 2000 characters'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const studentId = req.user.id;
    const { message } = req.body;
    
    const { data: request } = await supabase
      .from('clearance_requests')
      .select('*')
      .eq('id', id)
      .eq('student_id', studentId)
      .single();
    
    if (!request) {
      throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
    }
    
    const comments = request.comments || [];
    const newComment = {
      author: studentId,
      author_model: 'Student',
      authorName: req.user.fullName,
      message,
      is_internal: false,
      created_at: new Date().toISOString()
    };
    comments.push(newComment);
    
    await supabase.from('clearance_requests')
      .update({ comments })
      .eq('id', id);
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comments: comments.filter(c => !c.is_internal)
      }
    });
  })
);

/**
 * @route   GET /api/students/departments
 * @desc    Get all departments with contact info
 * @access  Student
 */
router.get('/departments',
  studentOnly,
  asyncHandler(async (req, res) => {
    const { data: departments } = await supabase
      .from('departments')
      .select('name, code, type, contact_info, location, office_hours, clearance_config')
      .eq('is_active', true)
      .order('name');
    
    const departmentsWithLinks = (departments || []).map(dept => ({
      ...dept,
      whatsappLink: dept.whatsapp ? `https://wa.me/${dept.whatsapp}` : null
    }));
    
    res.status(200).json({
      success: true,
      data: {
        departments: departmentsWithLinks
      }
    });
  })
);

/**
 * @route   GET /api/students/clearance-history
 * @desc    Get student clearance history
 * @access  Student
 */
router.get('/clearance-history',
  studentOnly,
  asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const { data: history, count } = await supabase
      .from('clearance_requests')
      .select('*, clearance_status(*, department:department_id(name, code))', { count: 'exact' })
      .eq('student_id', studentId)
      .in('status', ['cleared', 'cancelled', 'rejected'])
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  })
);

/**
 * @route   GET /api/students/certificate/:requestId
 * @desc    Download clearance certificate
 * @access  Student
 */
router.get('/certificate/:requestId',
  studentOnly,
  asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const studentId = req.user.id;
    
    const { data: request } = await supabase
      .from('clearance_requests')
      .select('*')
      .eq('request_id', requestId)
      .eq('student_id', studentId)
      .single();
    
    if (!request || !request.certificate?.issued) {
      throw new AppError('Certificate not found or not yet issued', 404, 'CERTIFICATE_NOT_FOUND');
    }
    
    res.status(200).json({
      success: true,
      data: {
        certificate: request.certificate
      }
    });
  })
);

module.exports = router;