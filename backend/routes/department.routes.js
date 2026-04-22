/**
 * Department Routes
 * Handles department staff operations
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const supabase = require('../config/supabase');
const appsScript = require('../services/appsScript.service');
const { authenticate, staffOnly, authorize } = require('../middleware/auth.middleware');
const { asyncHandler, AppError } = require('../middleware/error.middleware');

// Apply authentication and staff middleware to all routes
router.use(authenticate);
router.use(staffOnly);

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

/**
 * @route   GET /api/departments/dashboard
 * @desc    Get department dashboard
 * @access  Department Staff
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const departmentId = req.user.department_id;
  const isAdmin = req.user.role === 'admin';
  
  if (!departmentId && !isAdmin) {
    throw new AppError('No department assigned', 403, 'NO_DEPARTMENT');
  }
  
  // Get statistics
  let statsQuery = supabase.from('clearance_status').select('status');
  if (departmentId) statsQuery = statsQuery.eq('department_id', departmentId);
  
  const { data: statsRaw } = await statsQuery;
  
  const statsMap = (statsRaw || []).reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});
  
  // Get recent requests
  let recentQuery = supabase
    .from('clearance_requests')
    .select('*, student:student_id(first_name, last_name, registration_number, email, program, department_id, department:department_id(id, name, code)), clearance_status!inner(*)');
  
  if (departmentId) {
    recentQuery = recentQuery.eq('clearance_status.department_id', departmentId);
  }
  
  const { data: recentRequests } = await recentQuery
    .order('created_at', { ascending: false })
    .limit(10);
  
  // Get department info
  let department = null;
  if (departmentId) {
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select(`
        *,
        staff:profiles(first_name, last_name, email, role)
      `)
      .eq('id', departmentId)
      .single();
    
    if (deptError || !deptData) {
      console.error('Error fetching department data:', deptError);
      department = null;
    } else {
      department = deptData;
      // Fetch head info manually if assigned
      if (department.head_id) {
         const { data: headData } = await supabase
           .from('profiles')
           .select('first_name, last_name, email')
           .eq('id', department.head_id)
           .single();
         department.head = headData;
      }
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      stats: {
        pending: statsMap.pending || 0,
        inReview: statsMap.in_review || 0,
        cleared: statsMap.cleared || 0,
        rejected: statsMap.rejected || 0,
        total: statsRaw?.length || 0
      },
      recentRequests,
      department
    }
  });
}));

/**
 * @route   GET /api/departments/profile
 * @desc    Get department profile
 * @access  Department Staff
 */
router.get('/profile', asyncHandler(async (req, res) => {
  const departmentId = req.user.department_id;
  console.log('GET /profile - User:', req.user.email, 'DeptID:', departmentId);
  
  if (!departmentId) {
    console.error('No department ID found for user:', req.user.email);
    throw new AppError('No department assigned', 403, 'NO_DEPARTMENT');
  }
  
  try {
    const { data: department, error } = await supabase
      .from('departments')
      .select(`
        *,
        staff:profiles(first_name, last_name, email, phone, role)
      `)
      .eq('id', departmentId)
      .single();
    
    if (error) {
      console.error('Supabase error fetching profile:', error);
      throw error;
    }
    
    if (!department) {
      console.error('Department not found for ID:', departmentId);
      throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    }

    // Fetch head info manually if assigned
    if (department.head_id) {
      const { data: headData } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', department.head_id)
        .single();
      department.head = headData;
    }
    
    res.status(200).json({
      success: true,
      data: { department }
    });
  } catch (err) {
    console.error('Unhandled error in /profile:', err);
    throw err;
  }
}));

/**
 * @route   PUT /api/departments/profile
 * @desc    Update department profile
 * @access  Department Staff (HOD or Admin)
 */
router.put('/profile',
  authorize('admin', 'hod', 'finance_officer', 'library_officer', 'transport_officer'),
  asyncHandler(async (req, res) => {
    const departmentId = req.user.department_id || req.body.departmentId;
    
    if (!departmentId && req.user.role !== 'admin') {
      throw new AppError('No department assigned', 403, 'NO_DEPARTMENT');
    }
    
    const updates = {};
    const allowedFields = ['description', 'location', 'office_hours'];
    
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
      // Also allow camelCase from frontend
      if (f === 'office_hours' && req.body.officeHours !== undefined) updates.office_hours = req.body.officeHours;
    });

    if (req.body.contactInfo) updates.contact_info = req.body.contactInfo;
    if (req.body.clearanceConfig) updates.clearance_config = req.body.clearanceConfig;
    
    updates.updated_at = new Date().toISOString();
    updates.updated_by = req.user.id;
    
    const { data: department, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', departmentId)
      .select()
      .single();
    
    if (!department || error) {
      throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    }
    
    res.status(200).json({
      success: true,
      message: 'Department profile updated successfully',
      data: { department }
    });
  })
);

/**
 * @route   GET /api/departments/requests
 * @desc    Get all clearance requests for department
 * @access  Department Staff
 */
router.get('/requests', asyncHandler(async (req, res) => {
  const departmentId = req.user.department_id;
  const { status, search, page = 1, limit = 20 } = req.query;
  
  console.log('GET /requests - User:', req.user.email, 'Role:', req.user.role, 'DeptID:', departmentId);
  
  if (!departmentId && req.user.role !== 'admin') {
    throw new AppError('No department assigned', 403, 'NO_DEPARTMENT');
  }
  
  try {
    let queryBuilder = supabase
      .from('clearance_requests')
      .select('*, student:student_id(*, department:department_id(name, code)), clearance_status!inner(*)', { count: 'exact' });
    
    if (departmentId) {
      queryBuilder = queryBuilder.eq('clearance_status.department_id', departmentId);
    }
    
    if (status) {
      queryBuilder = queryBuilder.eq('clearance_status.status', status);
    }
    
    const { data: records, count, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) {
      console.error('Database error in /requests:', error);
      throw error;
    }
    
    res.status(200).json({
      success: true,
      data: {
        requests: (records || []).map(req => ({
          ...req,
          currentDepartmentStatus: Array.isArray(req.clearance_status) 
            ? req.clearance_status.find(ds => !departmentId || ds.department_id === departmentId)
            : req.clearance_status
        })),
        pagination: {
          total: count || 0,
          page: parseInt(page),
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });
  } catch (err) {
    console.error('Caught error in /requests:', err);
    throw err;
  }
}));

/**
 * @route   GET /api/departments/requests/:id
 * @desc    Get single clearance request details
 * @access  Department Staff
 */
router.get('/requests/:id',
  [
    param('id').isUUID().withMessage('Valid request ID required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const departmentId = req.user.department_id;
    
    const { data: request, error } = await supabase
      .from('clearance_requests')
      .select(`
        *,
        student:student_id(*, department:department_id(name, code)),
        clearance_status(*, department:department_id(name, code, type, contact_info), clearedBy:cleared_by(first_name, last_name))
      `)
      .eq('id', id)
      .single();
    
    if (!request || error) {
      throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
    }
    
    // Check if this department is involved
    const isInvolved = !departmentId || request.clearance_status.some(
      ds => ds.department_id === departmentId
    );
    
    if (!isInvolved && req.user.role !== 'admin') {
      throw new AppError('You do not have access to this request', 403, 'ACCESS_DENIED');
    }
    
    res.status(200).json({
      success: true,
      data: { request }
    });
  })
);

/**
 * @route   PUT /api/departments/requests/:id/status
 * @desc    Update clearance request status for department
 * @access  Department Staff
 */
router.put('/requests/:id/status',
  [
    param('id').isUUID().withMessage('Valid request ID required'),
    body('status')
      .isIn(['pending', 'in_review', 'cleared', 'rejected', 'on_hold'])
      .withMessage('Invalid status'),
    body('remarks')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Remarks cannot exceed 1000 characters'),
    body('dueAmount').optional().isNumeric().withMessage('Due amount must be a number'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, remarks, dueAmount, checklistUpdates } = req.body;
    const departmentId = req.user.department_id;
    const staffId = req.user.id;
    
    if (!departmentId && req.user.role !== 'admin') {
      throw new AppError('No department assigned', 403, 'NO_DEPARTMENT');
    }
    
    const { data: request } = await supabase
      .from('clearance_requests')
      .select('*, student:student_id(email)')
      .eq('id', id)
      .single();
    
    if (!request) {
      throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
    }
    
    const { data: deptStatus } = await supabase
      .from('clearance_status')
      .select('*')
      .eq('request_id', id)
      .eq('department_id', departmentId || req.body.department_id)
      .single();
    
    if (!deptStatus) {
      throw new AppError('Department not involved in this request', 404, 'DEPARTMENT_NOT_FOUND');
    }

    // Update checklist if provided
    let checklist = deptStatus.checklist_items || [];
    if (checklistUpdates && Array.isArray(checklistUpdates)) {
      checklist = checklist.map(item => {
        const update = checklistUpdates.find(u => u.item === item.item);
        if (update) {
          return {
            ...item,
            completed: update.completed,
            completed_at: update.completed ? new Date().toISOString() : null
          };
        }
        return item;
      });
    }

    // Update status entry
    await supabase.from('clearance_status')
      .update({
        status,
        remarks,
        due_amount: dueAmount,
        cleared_by: staffId,
        cleared_at: (status === 'cleared' || status === 'rejected') ? new Date().toISOString() : null,
        checklist_items: checklist
      })
      .eq('id', deptStatus.id);
    
    // Add to timeline
    const timeline = request.timeline || [];
    timeline.push({
      action: 'status_update',
      department: departmentId || req.body.department_id,
      status,
      remarks,
      performedBy: staffId,
      timestamp: new Date().toISOString()
    });

    await supabase.from('clearance_requests')
      .update({ timeline })
      .eq('id', id);
    
    // Check if overall request status should change
    // Simplified logic: for now we just emit update
    
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.student_id}`).emit('clearance-status-changed', {
        requestId: id,
        departmentId: departmentId || req.body.department_id,
        status,
        remarks
      });
    }
    
    // Send email notification via Apps Script
    try {
      // Get student profile for info
      const { data: student } = await supabase
        .from('student_profiles')
        .select('first_name, email')
        .eq('id', request.student_id)
        .single();

      if (student) {
        await appsScript.sendClearanceNotification({
          studentEmail: student.email,
          firstName: student.first_name || 'Student',
          requestId: request.request_id,
          status,
          message: remarks || `Your clearance status in ${departmentId || 'the department'} has been updated to ${status}.`
        });
      }
    } catch (notifyError) {
      console.error('Failed to send status update notification:', notifyError.message);
    }
    
    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`
    });
  })
);

/**
 * @route   POST /api/departments/requests/:id/comments
 * @desc    Add comment to clearance request
 * @access  Department Staff
 */
router.post('/requests/:id/comments',
  [
    param('id').isUUID().withMessage('Valid request ID required'),
    body('message')
      .trim()
      .notEmpty()
      .isLength({ max: 2000 })
      .withMessage('Message is required and cannot exceed 2000 characters'),
    body('isInternal').optional().isBoolean().withMessage('isInternal must be a boolean'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { message, isInternal = false } = req.body;
    const staffId = req.user.id;
    
    const { data: request } = await supabase
      .from('clearance_requests')
      .select('student_id, comments')
      .eq('id', id)
      .single();
    
    if (!request) {
      throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
    }
    
    const newComment = {
      author_id: staffId,
      author_name: req.user.fullName,
      message,
      is_internal: isInternal,
      created_at: new Date().toISOString()
    };
    
    const comments = request.comments || [];
    comments.push(newComment);

    await supabase.from('clearance_requests')
      .update({ comments })
      .eq('id', id);
    
    // Notify student if comment is not internal
    if (!isInternal) {
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${request.student_id}`).emit('new-comment', {
          requestId: id,
          message,
          authorName: req.user.fullName
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comments }
    });
  })
);

/**
 * @route   GET /api/departments/students
 * @desc    Get students in department (for academic departments)
 * @access  Department Staff (HOD)
 */
router.get('/students',
  authorize('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const departmentId = req.user.department_id;
    const { batch, clearanceStatus, page = 1, limit = 20 } = req.query;
    
    if (!departmentId && req.user.role !== 'admin') {
      throw new AppError('No department assigned', 403, 'NO_DEPARTMENT');
    }
    
    let queryBuilder = supabase
      .from('student_profiles')
      .select('*', { count: 'exact' });
    
    if (departmentId) queryBuilder = queryBuilder.eq('department_id', departmentId);
    if (batch) queryBuilder = queryBuilder.eq('batch', batch);
    if (clearanceStatus) queryBuilder = queryBuilder.eq('clearance_status', clearanceStatus);
    
    const { data: students, count, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      data: {
        students,
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
 * @route   GET /api/departments/pending-requests
 * @desc    Get pending requests count (for notifications)
 * @access  Department Staff
 */
router.get('/pending-requests', asyncHandler(async (req, res) => {
  const departmentId = req.user.department_id;
  
  if (!departmentId && req.user.role !== 'admin') {
    return res.status(200).json({
      success: true,
      data: { count: 0 }
    });
  }
  
  let query = supabase
    .from('clearance_status')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'in_review']);
  
  if (departmentId) query = query.eq('department_id', departmentId);
  
  const { count, error } = await query;
  
  if (error) throw error;
  
  res.status(200).json({
    success: true,
    data: { count }
  });
}));

module.exports = router;