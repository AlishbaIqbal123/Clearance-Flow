/**
 * Admin Routes
 * Handles admin-specific operations
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const appsScript = require('../services/appsScript.service');
const { adminOnly, authorize } = require('../middleware/auth.middleware');
const { asyncHandler, AppError } = require('../middleware/error.middleware');
const csv = require('fast-csv');

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

// Apply authorization middleware selectively
const hodOrAdmin = authorize('admin', 'hod');
const adminPlus = authorize('admin');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Admin
 */
router.get('/dashboard', adminPlus, asyncHandler(async (req, res) => {
  // Get counts
  const { count: totalStudents } = await supabase.from('student_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const { count: totalDepartments } = await supabase.from('departments').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const { count: totalStaff } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').eq('is_active', true);
  
  // Clearance statistics
  const { data: requests } = await supabase.from('clearance_requests').select('status');
  
  const clearanceMap = (requests || []).reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});
  
  // Recent clearance requests
  const { data: requestsRaw } = await supabase
    .from('clearance_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  // Fetch students for these requests
  const studentIds = [...new Set((requestsRaw || []).map(r => r.student_id))];
  const { data: students } = await supabase
    .from('student_profiles')
    .select('id, first_name, last_name, registration_number')
    .in('id', studentIds);
  
  const recentRequests = (requestsRaw || []).map(r => ({
    ...r,
    student: students?.find(s => s.id === r.student_id)
  }));
  
  // Department-wise pending requests
  const { data: deptPendingStatsRaw } = await supabase
    .from('clearance_status')
    .select('department_id, status')
    .in('status', ['pending', 'in_review']);
  
  // Fetch department names for these stats
  const pendingDeptIds = [...new Set((deptPendingStatsRaw || []).map(ps => ps.department_id))];
  const { data: pendingDepts } = await supabase
    .from('departments')
    .select('id, name')
    .in('id', pendingDeptIds);
  
  const deptPendingStatsMap = (deptPendingStatsRaw || []).reduce((acc, curr) => {
    const dept = pendingDepts?.find(d => d.id === curr.department_id);
    const name = dept?.name || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const deptPendingStats = Object.entries(deptPendingStatsMap).map(([name, count]) => ({
    departmentName: name,
    count
  }));
  
  // Monthly clearance trend (Mocking calculation for now or using simple select if small)
  const monthlyTrend = []; // To implement properly later

  res.status(200).json({
    success: true,
    data: {
      counts: {
        totalStudents,
        totalDepartments,
        totalStaff,
        totalClearanceRequests: requests?.length || 0
      },
      clearanceStats: clearanceMap,
      recentRequests,
      departmentPendingStats: deptPendingStats,
      monthlyTrend
    }
  });
}));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (staff)
 * @access  Admin
 */
router.get('/users', adminPlus, asyncHandler(async (req, res) => {
  const { role, department, search, page = 1, limit = 20 } = req.query;
  
  let queryBuilder = supabase
    .from('profiles')
    .select('*, department:department_id(name, code)', { count: 'exact' })
    .neq('role', 'admin');
  
  if (role) queryBuilder = queryBuilder.eq('role', role);
  if (department) queryBuilder = queryBuilder.eq('department_id', department);
  if (search) {
    queryBuilder = queryBuilder.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  
  const { data: usersRaw, count, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  
  if (error) throw error;

  // Fetch departments separately to avoid join errors
  const deptIds = [...new Set((usersRaw || []).map(u => u.department_id).filter(id => id))];
  const { data: depts } = await supabase
    .from('departments')
    .select('id, name, code')
    .in('id', deptIds);

  const users = (usersRaw || []).map(u => ({
    ...u,
    department: depts?.find(d => d.id === u.department_id)
  }));

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    }
  });
}));

/**
 * @route   POST /api/admin/users
 * @desc    Create new user (staff)
 * @access  Admin
 */
router.post('/users',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer'])
      .withMessage('Invalid role'),
    body('department').optional().isUUID().withMessage('Valid department ID required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, role, department, departmentId, phone } = req.body;
    
    // Check if email exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error } = await supabase
      .from('profiles')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        department_id: departmentId || department,
        phone,
        is_first_login: true
      })
      .select()
      .single();
    
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          department: user.department_id
        }
      }
    });
  })
);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Admin
 */
router.put('/users/:id',
  [
    param('id').isUUID().withMessage('Valid user ID required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    
    // Remap fields to supabase schema
    if (updates.firstName) {
      updates.first_name = updates.firstName;
      delete updates.firstName;
    }
    if (updates.lastName) {
      updates.last_name = updates.lastName;
      delete updates.lastName;
    }
    if (updates.department) {
      updates.department_id = updates.department;
      delete updates.department;
    }
    if (updates.departmentId) {
      updates.department_id = updates.departmentId;
      delete updates.departmentId;
    }

    // Don't allow password update through this route
    delete updates.password;
    delete updates.id;
    
    const { data: user, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('*, department:department_id(name, code)')
      .single();
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user'
      });
    }

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  })
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Deactivate user (soft delete)
 * @access  Admin
 */
router.delete('/users/:id',
  [
    param('id').isUUID().withMessage('Valid user ID required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  })
);

/**
 * @route   GET /api/admin/students
 * @desc    Get all students with filters
 * @access  Admin
 */
router.get('/students', hodOrAdmin, asyncHandler(async (req, res) => {
  const { 
    department, 
    batch, 
    clearanceStatus, 
    enrollmentStatus,
    search, 
    page = 1, 
    limit = 20 
  } = req.query;
  
  let queryBuilder = supabase
    .from('student_profiles')
    .select('*, department:department_id(name, code)', { count: 'exact' })
    .eq('is_active', true);

  // If not admin, only show students who have a clearance request with the user's department
  if (req.user.role !== 'admin' && req.user.department_id) {
    const { data: requestIds } = await supabase
      .from('clearance_status')
      .select('request_id')
      .eq('department_id', req.user.department_id);
    
    if (requestIds && requestIds.length > 0) {
      const { data: studentIds } = await supabase
        .from('clearance_requests')
        .select('student_id')
        .in('id', requestIds.map(r => r.request_id));
      
      const uniqueStudentIds = [...new Set(studentIds?.map(s => s.student_id))];
      queryBuilder = queryBuilder.in('id', uniqueStudentIds);
    } else {
      // No requests for this department yet
      queryBuilder = queryBuilder.in('id', ['00000000-0000-0000-0000-000000000000']);
    }
  }
  
  if (department) queryBuilder = queryBuilder.eq('department_id', department);
  if (batch) queryBuilder = queryBuilder.eq('batch', batch);
  if (clearanceStatus) queryBuilder = queryBuilder.eq('clearance_status', clearanceStatus);
  if (enrollmentStatus) queryBuilder = queryBuilder.eq('enrollment_status', enrollmentStatus);
  if (search) {
    queryBuilder = queryBuilder.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,registration_number.ilike.%${search}%,email.ilike.%${search}%`);
  }
  
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
}));

/**
 * @route   POST /api/admin/students
 * @desc    Create new student
 * @access  Admin
 */
router.post('/students',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 1 }).withMessage('Password must be at least 8 characters'),
    body('departmentId').isUUID().withMessage('Valid department ID required'),
    body('program').notEmpty().withMessage('Program is required'),
    body('discipline').optional().notEmpty().withMessage('Discipline is required'),
    body('batch').matches(/^\d{4}$/).withMessage('Batch must be a valid year'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { firstName, lastName, registrationNumber, email, password, departmentId, program, discipline, batch } = req.body;
    const department = departmentId;
    const finalDiscipline = discipline || program; // Default to program if discipline is not provided
    
    // Check if registration number exists
    const { data: existingStudent } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('registration_number', registrationNumber.toUpperCase())
      .single();
    
    if (existingStudent) {
      throw new AppError('Registration number already exists', 409, 'REG_NUMBER_EXISTS');
    }
    
    // Check if email exists
    const { data: existingEmail } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingEmail) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }
    
    const finalPassword = password || firstName;
    const hashedPassword = await bcrypt.hash(finalPassword, 12);

    const { data: student, error } = await supabase
      .from('student_profiles')
      .insert({
        first_name: firstName,
        last_name: lastName,
        registration_number: registrationNumber.toUpperCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        department_id: department,
        program,
        discipline: finalDiscipline,
        batch,
        is_first_login: true,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) throw error;

    // Create student email via Apps Script
    try {
      await appsScript.createStudentEmail({
        firstName,
        lastName,
        registrationNumber: registrationNumber.toUpperCase(),
        personalEmail: email.toLowerCase(),
        department: department,
        program,
        discipline: finalDiscipline,
        batch
      });
    } catch (createEmailError) {
      console.error('Failed to initiate student email creation:', createEmailError.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        student: {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          registrationNumber: student.registration_number,
          email: student.email,
          department: student.department_id
        }
      }
    });
  })
);

/**
 * @route   POST /api/admin/students/bulk-import
 * @desc    Bulk import students from CSV
 * @access  Admin
 */
router.post('/students/bulk-import', asyncHandler(async (req, res) => {
  if (!req.files || !req.files.csv) {
    throw new AppError('CSV file is required', 400, 'FILE_REQUIRED');
  }
  
  const csvFile = req.files.csv;
  const results = {
    success: [],
    failed: []
  };
  
  // Parse CSV
  const rows = [];
  await new Promise((resolve, reject) => {
    csv.parseString(csvFile.data.toString(), { headers: true })
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  
  // Process each row
  for (const row of rows) {
    try {
      // Validate required fields
      if (!row.registrationNumber || !row.firstName || !row.lastName || !row.email || !row.department) {
        throw new Error('Missing required fields');
      }
      
      // Find department by code
      const { data: department } = await supabase
        .from('departments')
        .select('id')
        .eq('code', row.department.toUpperCase())
        .single();

      if (!department) {
        throw new Error(`Department ${row.department} not found`);
      }
      
      const defaultPassword = row.firstName || row.registrationNumber.toUpperCase();
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      // Create student with default password (registration number)
      const { data: student, error } = await supabase
        .from('student_profiles')
        .insert({
          first_name: row.firstName,
          last_name: row.lastName,
          registration_number: row.registrationNumber.toUpperCase(),
          email: row.email.toLowerCase(),
          password: hashedPassword,
          department_id: department.id,
          program: row.program,
          discipline: row.discipline,
          batch: row.batch,
          is_first_login: true,
          created_by: req.user.id
        })
        .select()
        .single();
      
      if (error) throw error;

      // Create student email via Apps Script
      try {
        await appsScript.createStudentEmail({
          firstName: row.firstName,
          lastName: row.lastName,
          registrationNumber: row.registrationNumber.toUpperCase(),
          personalEmail: row.email.toLowerCase(),
          department: department.id,
          program: row.program,
          discipline: row.discipline,
          batch: row.batch
        });
      } catch (scriptError) {
        console.error(`Failed to initiate email creation for ${row.registrationNumber}:`, scriptError.message);
      }
      
      results.success.push({
        registrationNumber: row.registrationNumber.toUpperCase(),
        name: `${row.firstName} ${row.lastName}`
      });
    } catch (error) {
      results.failed.push({
        row,
        error: error.message
      });
    }
  }
  
  res.status(200).json({
    success: true,
    message: `Imported ${results.success.length} students, ${results.failed.length} failed`,
    data: results
  });
}));

/**
 * @route   PUT /api/admin/students/:id
 * @desc    Update student
 * @access  Admin
 */
router.put('/students/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  
  delete updates.password; // Don't update password through this route
  updates.updated_by = req.user.id;
  
  // Remap fields to supabase schema
  if (updates.firstName) {
    updates.first_name = updates.firstName;
    delete updates.firstName;
  }
  if (updates.lastName) {
    updates.last_name = updates.lastName;
    delete updates.lastName;
  }
  if (updates.registrationNumber) {
    updates.registration_number = updates.registrationNumber.toUpperCase();
    delete updates.registrationNumber;
  }
  if (updates.department) {
    updates.department_id = updates.department;
    delete updates.department;
  }
  if (updates.departmentId) {
    updates.department_id = updates.departmentId;
    delete updates.departmentId;
  }

  const { data: student, error } = await supabase
    .from('student_profiles')
    .update(updates)
    .eq('id', id)
    .select('*, department:department_id(name, code)')
    .single();
  
  if (!student || error) {
    throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: { student }
  });
}));

/**
 * @route   GET /api/admin/students/export
 * @desc    Export students to CSV
 * @access  Admin
 */
router.get('/students/export', adminPlus, asyncHandler(async (req, res) => {
  const { data: students, error } = await supabase
    .from('student_profiles')
    .select('registration_number, first_name, last_name, email, program, batch, enrollment_status')
    .eq('is_active', true)
    .order('registration_number');
  
  if (error) throw error;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=students_registry.csv');
  
  const csvStream = csv.format({ headers: true });
  csvStream.pipe(res);
  
  students.forEach(student => {
    csvStream.write({
      'Reg Number': student.registration_number,
      'First Name': student.first_name,
      'Last Name': student.last_name,
      'Email': student.email,
      'Program': student.program,
      'Batch': student.batch,
      'Status': student.enrollment_status
    });
  });
  
  csvStream.end();
}));

/**
 * @route   DELETE /api/admin/students/:id
 * @desc    Deactivate student
 * @access  Admin
 */
router.delete('/students/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { error } = await supabase
    .from('student_profiles')
    .update({ is_active: false, updated_by: req.user.id })
    .eq('id', id);
  
  if (error) {
    throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Student deactivated successfully'
  });
}));

/**
 * @route   GET /api/admin/departments
 * @desc    Get all departments
 * @access  Admin
 */
router.get('/departments', hodOrAdmin, asyncHandler(async (req, res) => {
  const { data: departments, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  res.status(200).json({
    success: true,
    data: { departments }
  });
}));

/**
 * @route   POST /api/admin/departments
 * @desc    Create new department
 * @access  Admin
 */
router.post('/departments',
  [
    body('name').trim().notEmpty().withMessage('Department name is required'),
    body('code').trim().notEmpty().withMessage('Department code is required'),
    body('type').isIn(['academic', 'administrative', 'finance', 'library', 'transport', 'hostel', 'sports', 'medical', 'security', 'custom'])
      .withMessage('Invalid department type'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { name, code, type, description, contactInfo, clearanceConfig } = req.body;
    
    // Check if code exists
    const { data: existingDept } = await supabase
      .from('departments')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (existingDept) {
      throw new AppError('Department code already exists', 409, 'CODE_EXISTS');
    }
    
    const { data: department, error } = await supabase
      .from('departments')
      .insert({
        name,
        code: code.toUpperCase(),
        type,
        description,
        contact_info: contactInfo,
        clearance_config: clearanceConfig,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
  })
);

/**
 * @route   PUT /api/admin/departments/:id
 * @desc    Update department
 * @access  Admin
 */
router.put('/departments/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  updates.updated_by = req.user.id;
  
  if (updates.contactInfo) {
    updates.contact_info = updates.contactInfo;
    delete updates.contactInfo;
  }
  if (updates.clearanceConfig) {
    updates.clearance_config = updates.clearanceConfig;
    delete updates.clearanceConfig;
  }

  const { data: department, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (!department || error) {
    throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: { department }
  });
}));

/**
 * @route   DELETE /api/admin/departments/:id
 * @desc    Deactivate department
 * @access  Admin
 */
router.delete('/departments/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if department has staff
  const { count: staffCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('department_id', id)
    .eq('is_active', true);

  if (staffCount > 0) {
    throw new AppError('Cannot deactivate department with active staff', 400, 'DEPARTMENT_HAS_STAFF');
  }
  
  const { error } = await supabase
    .from('departments')
    .update({ is_active: false, updated_by: req.user.id })
    .eq('id', id);
  
  if (error) {
    throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Department deactivated successfully'
  });
}));

/**
 * @route   GET /api/admin/clearance-requests
 * @desc    Get all clearance requests
 * @access  Admin
 */
router.get('/clearance-requests', hodOrAdmin, asyncHandler(async (req, res) => {
  const { status, department, page = 1, limit = 20 } = req.query;
  
  let queryBuilder = supabase
    .from('clearance_requests')
    .select('*', { count: 'exact' });
  
  if (status) queryBuilder = queryBuilder.eq('status', status);
  
  const { data: requestsRaw, count, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  
  if (error) throw error;

  // Manual join for students and status
  const studentIdsRes = [...new Set((requestsRaw || []).map(r => r.student_id))];
  const requestIdsStrings = (requestsRaw || []).map(r => r.id);

  const { data: studentsRes } = await supabase
    .from('student_profiles')
    .select('id, first_name, last_name, registration_number, email, department_id')
    .in('id', studentIdsRes);

  const { data: statusesRaw } = await supabase
    .from('clearance_status')
    .select('*')
    .in('request_id', requestIdsStrings);

  // Fetch department names for these statuses
  const statusDeptIds = [...new Set((statusesRaw || []).map(s => s.department_id))];
  const { data: statusDepts } = await supabase
    .from('departments')
    .select('id, name, code')
    .in('id', statusDeptIds);

  const requests = (requestsRaw || []).map(r => ({
    ...r,
    student: studentsRes?.find(s => s.id === r.student_id),
    clearance_status: (statusesRaw || []).filter(s => s.request_id === r.id).map(s => ({
      ...s,
      department: statusDepts?.find(d => d.id === s.department_id)
    }))
  }));
  
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
}));

/**
 * @route   POST /api/admin/reset-student-password/:id
 * @desc    Reset student password to default
 * @access  Admin
 */
router.post('/reset-student-password/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { data: student } = await supabase
    .from('student_profiles')
    .select('registration_number')
    .eq('id', id)
    .single();

  if (!student) {
    throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
  }
  
  const hashedPassword = await bcrypt.hash(student.registration_number, 12);

  await supabase.from('student_profiles')
    .update({
      password: hashedPassword,
      is_first_login: true
    })
    .eq('id', id);
  
  // Reset password in Google Workspace via Apps Script
  try {
    if (student.university_email) {
      await appsScript.resetPassword(student.university_email);
    } else {
      // If university email is not set, we might try personal email if the script handles it
      // or just skip. For now, we try university_email.
    }
  } catch (resetError) {
    console.error('Failed to reset Google Workspace password:', resetError.message);
  }
  
  res.status(200).json({
    success: true,
    message: 'Password reset successfully. Student must login with registration number as password.'
  });
}));

/**
 * @route   POST /api/admin/reset-official-password/:id
 * @desc    Reset official password to default
 * @access  Admin
 */
router.post('/reset-official-password/:id', adminPlus, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { data: user } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', id)
    .single();

  if (!user) {
    throw new AppError('Official not found', 404, 'USER_NOT_FOUND');
  }
  
  const defaultPassword = 'official123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  const { error } = await supabase.from('profiles')
    .update({
      password: hashedPassword,
      is_first_login: true
    })
    .eq('id', id);
  
  if (error) throw error;

  res.status(200).json({
    success: true,
    message: `Password reset successfully for ${user.email}. Default password is 'official123'.`
  });
}));

module.exports = router;