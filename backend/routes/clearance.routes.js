/**
 * Clearance Routes
 * Handles clearance request operations for all user types
 */

const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const supabase = require('../config/supabase');
const appsScript = require('../services/appsScript.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler, AppError } = require('../middleware/error.middleware');

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
 * @route   GET /api/clearance
 * @desc    Get all clearance requests (with filters)
 * @access  Admin, HOD
 */
router.get(['/', '/requests'],
  authorize('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const { 
      status, 
      requestType, 
      department, 
      student,
      startDate, 
      endDate,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let queryBuilder = supabase
      .from('clearance_requests')
      .select('*, student:student_id(first_name, last_name, registration_number, email), clearance_status(*, department:department_id(name, code))', { count: 'exact' });
    
    if (status) queryBuilder = queryBuilder.eq('status', status);
    if (requestType) queryBuilder = queryBuilder.eq('request_type', requestType);
    if (student) queryBuilder = queryBuilder.eq('student_id', student);
    
    if (startDate) queryBuilder = queryBuilder.gte('created_at', startDate);
    if (endDate) queryBuilder = queryBuilder.lte('created_at', endDate);
    
    const { data: requests, count, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      data: {
        requests,
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
 * @route   GET /api/clearance/requests/:id
 * @desc    Get single clearance request by ID
 * @access  Authenticated
 */
router.get('/requests/:id',
  [
    param('id').isUUID().withMessage('Valid request ID required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userType = req.user.userType;
    
    const { data: request, error } = await supabase
      .from('clearance_requests')
      .select(`
        *,
        student:student_id(*, department:department_id(name, code)),
        clearance_status(*, department:department_id(name, code, type, contact_info, clearance_config), clearedBy:cleared_by(first_name, last_name, email))
      `)
      .eq('id', id)
      .single();
    
    if (!request || error) {
      throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
    }
    
    // Check access permissions
    const isStudent = userType === 'student';
    const isOwner = request.student_id === userId;
    const isAdmin = userRole === 'admin';
    const isStaff = userType !== 'student';
    
    // Students can only view their own requests
    if (isStudent && !isOwner) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }
    
    // Department staff can only view requests involving their department
    if (isStaff && !isAdmin) {
      const userDept = req.user.department?.id;
      const isInvolved = request.clearance_status.some(
        ds => ds.department_id === userDept
      );
      
      if (!isInvolved) {
        throw new AppError('Access denied', 403, 'ACCESS_DENIED');
      }
    }
    
    res.status(200).json({
      success: true,
      data: { request }
    });
  })
);

/**
 * @route   GET /api/clearance/requests/by-request-id/:requestId
 * @desc    Get clearance request by request ID (CLR-XXX)
 * @access  Admin
 */
router.get('/requests/by-request-id/:requestId',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    
    const { data: request, error } = await supabase
      .from('clearance_requests')
      .select(`
        *,
        student:student_id(*, department:department_id(name, code)),
        clearance_status(*, department:department_id(name, code, type, contact_info), clearedBy:cleared_by(first_name, last_name))
      `)
      .eq('request_id', requestId)
      .single();
    
    if (!request || error) {
      throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
    }
    
    res.status(200).json({
      success: true,
      data: { request }
    });
  })
);

/**
 * @route   POST /api/clearance/requests/:id/issue-certificate
 * @desc    Issue clearance certificate
 * @access  Admin
 */
router.post('/requests/:id/issue-certificate',
  authorize('admin'),
  [
    param('id').isUUID().withMessage('Valid request ID required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const { data: request } = await supabase
      .from('clearance_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!request) {
      throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
    }
    
    if (request.status !== 'cleared') {
      throw new AppError('Can only issue certificate for cleared requests', 400, 'NOT_CLEARED');
    }
    
    if (request.certificate?.issued) {
      throw new AppError('Certificate already issued', 400, 'CERTIFICATE_EXISTS');
    }
    
    const timestamp = Date.now().toString(36).toUpperCase();
    const certificateNumber = `CERT-${request.request_id}-${timestamp}`;
    
    const timeline = request.timeline || [];
    timeline.push({
      action: 'completed',
      performedBy: adminId,
      performedByModel: 'User',
      description: 'Clearance certificate issued',
      timestamp: new Date().toISOString()
    });

    const certificate = {
      issued: true,
      issued_at: new Date().toISOString(),
      issued_by: adminId,
      certificate_number: certificateNumber
    };

    await supabase.from('clearance_requests')
      .update({
        certificate,
        timeline
      })
      .eq('id', id);
    
    // Update student clearance status
    await supabase.from('student_profiles')
      .update({ clearance_status: 'cleared' })
      .eq('id', request.student_id);
    
    // Notify student
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.student_id}`).emit('certificate-issued', {
        requestId: id,
        certificateNumber: certificateNumber
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
        await appsScript.sendCertificateNotification({
          studentEmail: student.email,
          firstName: student.first_name || 'Student',
          requestId: request.request_id,
          certificateNumber: certificateNumber
        });
      }
    } catch (notifyError) {
      console.error('Failed to send certificate notification:', notifyError.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Certificate issued successfully',
      data: { certificate }
    });
  })
);

/**
 * @route   GET /api/clearance/statistics
 * @desc    Get clearance statistics
 * @access  Admin, HOD
 */
router.get('/statistics',
  authorize('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const { startDate, endDate, department } = req.query;
    
    // Overall statistics
    const { data: requests } = await supabase.from('clearance_requests').select('status, request_type');
    
    const overallStats = (requests || []).reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    const typeStats = (requests || []).reduce((acc, curr) => {
      acc[curr.request_type] = (acc[curr.request_type] || 0) + 1;
      return acc;
    }, {});

    // Department-wise stats
    let deptStatsQuery = supabase.from('clearance_status').select('status, department:department_id(name)');
    if (department) deptStatsQuery = deptStatsQuery.eq('department_id', department);
    
    const { data: deptData } = await deptStatsQuery;
    
    const departmentStats = (deptData || []).reduce((acc, curr) => {
      const name = curr.department.name;
      acc[name] = acc[name] || {};
      acc[name][curr.status] = (acc[name][curr.status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        overallStats,
        typeStats,
        departmentStats,
        monthlyTrend: []
      }
    });
  })
)

/**
 * @route   GET /api/clearance/recent
 * @desc    Get recent clearance requests
 * @access  Admin
 */
router.get('/recent',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    
    const { data: requests, error } = await supabase
      .from('clearance_requests')
      .select('*, student:student_id(first_name, last_name, registration_number), clearance_status(status, department:department_id(name, code))')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      data: { requests }
    });
  })
)

/**
 * @route   GET /api/clearance/pending
 * @desc    Get all pending clearance requests
 * @access  Admin
 */
router.get('/pending',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    
    const { data: requests, count, error } = await supabase
      .from('clearance_requests')
      .select('*, student:student_id(*, department:department_id(name, code)), clearance_status(status, department:department_id(name, code))', { count: 'exact' })
      .in('status', ['submitted', 'in_progress', 'partially_cleared', 'pending'])
      .order('created_at', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  })
)

/**
 * @route   DELETE /api/clearance/requests/:id
 * @desc    Delete clearance request (admin only)
 * @access  Admin
 */
router.delete('/requests/:id',
  authorize('admin'),
  [
    param('id').isUUID().withMessage('Valid request ID required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const { data: request } = await supabase
      .from('clearance_requests')
      .select('student_id')
      .eq('id', id)
      .single();

    if (!request) {
      throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
    }

    const { error } = await supabase
      .from('clearance_requests')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Update student clearance status
    await supabase.from('student_profiles')
      .update({ clearance_status: 'not_started' })
      .eq('id', request.student_id);
    
    res.status(200).json({
      success: true,
      message: 'Clearance request deleted successfully'
    });
  })
);

module.exports = router;