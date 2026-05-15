/**
 * Authentication Routes
 * Handles login, profile, and password management for all users
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { authenticate, generateToken } = require('../middleware/auth.middleware');
const { asyncHandler, AppError } = require('../middleware/error.middleware');
const appsScript = require('../services/appsScript.service');
const emailService = require('../services/email.service');

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
 * @route   POST /api/auth/login
 * @desc    Login department staff or admin
 * @access  Public
 */
router.post('/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Find user in profiles table
    console.log('Login attempt for:', normalizedEmail);
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*, department:department_id(*)')
      .eq('email', normalizedEmail)
      .single();

    if (error || !user) {
      if (error) {
        console.error('Staff login DB error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } else {
        console.log('Staff login failed: User not found for email:', normalizedEmail);
      }
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.is_active) {
      console.log('Login blocked: User account is inactive for', normalizedEmail);
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Check password
    console.log('Attempting bcrypt comparison for', normalizedEmail);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Bcrypt comparison result:', isMatch);
    
    if (!isMatch) {
      console.log('Staff login failed: Password mismatch for', normalizedEmail);
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Dynamically map role for Exam Department staff
    let effectiveRole = user.role;
    if (user.role === 'department_officer' && user.department?.contact_info?.custom_type === 'exam') {
      effectiveRole = 'exam_officer';
    }

    // Create user response object
    const userResponse = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: effectiveRole,
      department: user.department,
      avatar: user.avatar_url,
      phone: user.phone,
      isFirstLogin: user.is_first_login,
      userType: 'staff'
    };

    const token = generateToken({ 
      id: user.id, 
      userType: 'staff',
      role: effectiveRole 
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userResponse,
      data: {
        user: userResponse,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });
  })
);

/**
 * @route   POST /api/auth/student/login
 * @desc    Login student
 * @access  Public
 */
router.post('/student/login',
  [
    body('registrationNumber').optional().trim().toUpperCase(),
    body('email').optional().isEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { registrationNumber, email, password } = req.body;
    const cleanReg = registrationNumber ? registrationNumber.trim().toUpperCase() : null;
    const cleanEmail = email ? email.trim().toLowerCase() : null;

    let query = supabase
      .from('student_profiles')
      .select('*, department:department_id(*)');

    if (cleanReg) {
      query = query.eq('registration_number', cleanReg);
    } else if (cleanEmail) {
      query = query.eq('email', cleanEmail);
    } else {
      throw new AppError('Registration number or email required', 400);
    }

    const { data: student, error } = await query.single();

    if (error || !student) {
      if (error) console.error('Student login DB error:', error);
      else console.log('Student login failed: Student not found for registrationNumber:', registrationNumber);
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!student.is_active) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Create user response object
    const userResponse = {
      id: student.id,
      registrationNumber: student.registration_number,
      firstName: student.first_name,
      lastName: student.last_name,
      fullName: `${student.first_name} ${student.last_name}`,
      email: student.email,
      universityEmail: student.email,
      role: 'student',
      department: student.department,
      program: student.program,
      discipline: student.discipline,
      batch: student.batch,
      semester: student.semester,
      avatar: student.avatar_url,
      phone: student.phone,
      isFirstLogin: student.is_first_login,
      userType: 'student'
    };

    const token = generateToken({ 
      id: student.id, 
      userType: 'student',
      role: 'student' 
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userResponse,
      data: {
        user: userResponse,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });
  })
);

/**
 * @route   POST /api/auth/student/signup
 * @desc    Register a new student
 * @access  Public
 */
router.post('/student/signup',
  [
    body('registrationNumber').notEmpty().withMessage('Registration number is required').trim().toUpperCase(),
    body('firstName').notEmpty().withMessage('First name is required').trim(),
    body('lastName').notEmpty().withMessage('Last name is required').trim(),
    body('email').isEmail().withMessage('Please provide a valid university email').trim().toLowerCase(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('departmentId').notEmpty().withMessage('Department is required'),
    body('program').notEmpty().withMessage('Program is required'),
    body('discipline').notEmpty().withMessage('Discipline is required'),
    body('batch').notEmpty().withMessage('Batch is required'),
    body('phone').notEmpty().withMessage('Active phone number is required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { 
      registrationNumber, firstName, lastName, email, 
      password, departmentId, program, discipline, batch, phone 
    } = req.body;

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('student_profiles')
      .select('id')
      .or(`registration_number.eq.${registrationNumber.toUpperCase()},email.eq.${email.toLowerCase()}`)
      .single();

    if (existingStudent) {
      throw new AppError('Student with this registration number or email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create student profile
    const { data: newStudent, error: createError } = await supabase
      .from('student_profiles')
      .insert([{
        registration_number: registrationNumber.trim().toUpperCase(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        department_id: departmentId,
        program,
        discipline,
        batch,
        phone: phone ? phone.trim() : null,
        is_active: true,
        is_first_login: false,
        clearance_status: 'not_started'
      }])
      .select()
      .single();

    if (createError) {
      console.error('Student signup error:', createError);
      throw new AppError('Failed to create student profile', 500);
    }

    // Auto-initialize clearance status for all departments
    const { data: departments } = await supabase.from('departments').select('id');
    
    if (departments && departments.length > 0) {
      const clearanceEntries = departments.map(dept => ({
        student_id: newStudent.id,
        department_id: dept.id,
        status: 'pending',
        remarks: 'Automatically initialized on signup'
      }));

      await supabase.from('clearance_status').insert(clearanceEntries);
    }

    // Generate token
    const token = generateToken({ 
      id: newStudent.id, 
      userType: 'student',
      role: 'student' 
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: {
        id: newStudent.id,
        registrationNumber: newStudent.registration_number,
        firstName: newStudent.first_name,
        lastName: newStudent.last_name,
        fullName: `${newStudent.first_name} ${newStudent.last_name}`,
        email: newStudent.email,
        role: 'student',
        userType: 'student'
      }
    });
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const { id, userType } = req.user;

  let user;
  if (userType === 'student') {
    const { data } = await supabase
      .from('student_profiles')
      .select('*, department:department_id(*)')
      .eq('id', id)
      .single();
    
    if (!data) throw new AppError('User not found', 404);
    
    user = {
      id: data.id,
      registrationNumber: data.registration_number,
      firstName: data.first_name,
      lastName: data.last_name,
      fullName: `${data.first_name} ${data.last_name}`,
      email: data.email,
      universityEmail: data.email,
      role: 'student',
      department: data.department,
      program: data.program,
      discipline: data.discipline,
      batch: data.batch,
      semester: data.semester,
      avatar: data.avatar_url,
      phone: data.phone,
      isFirstLogin: data.is_first_login,
      userType: 'student'
    };
  } else {
    const { data } = await supabase
      .from('profiles')
      .select('*, department:department_id(*)')
      .eq('id', id)
      .single();
    
    if (!data) throw new AppError('User not found', 404);
    
    user = {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      fullName: `${data.first_name} ${data.last_name}`,
      email: data.email,
      role: data.role,
      department: data.department,
      avatar: data.avatar_url,
      phone: data.phone,
      isFirstLogin: data.is_first_login,
      userType: 'staff'
    };
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
}));

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { id, userType } = req.user;

    const table = userType === 'student' ? 'student_profiles' : 'profiles';
    
    // Get user with password
    const { data: user, error } = await supabase
      .from(table)
      .select('password')
      .eq('id', id)
      .single();

    if (error || !user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear first login flag
    const { error: updateError } = await supabase
      .from(table)
      .update({ 
        password: hashedPassword,
        is_first_login: false
      })
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Submit forgot password request
 * @access  Public
 */
router.post('/forgot-password',
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('type').isIn(['student', 'staff']).withMessage('Valid user type is required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { email, registrationNumber, type } = req.body;
    const table = type === 'student' ? 'student_profiles' : 'profiles';

    // Find user
    const selectFields = type === 'student' ? 'id, first_name, email' : 'id, first_name, email, role';
    let query = supabase.from(table).select(selectFields);
    
    if (type === 'student' && registrationNumber) {
      query = query.eq('registration_number', registrationNumber.toUpperCase());
    } else if (email) {
      query = query.eq('email', email.toLowerCase());
    } else {
      return res.status(400).json({
        success: false,
        message: type === 'student' ? 'Registration number or email is required' : 'Email is required'
      });
    }

    const { data: user } = await query.single();

    if (!user || !user.email) {
      return res.status(404).json({
        success: false,
        message: type === 'student' 
          ? 'No student account found associated with this registration number.' 
          : 'No official account found associated with this email address.'
      });
    }

    // Mask the email for display (e.g. abc......@gmail.com)
    const userEmail = user.email;
    const [name, domain] = userEmail.split('@');
    const maskedEmail = name && domain ? (name.length > 3 
      ? name.substring(0, 3) + '......@' + domain 
      : name + '......@' + domain) : 'abc......@gmail.com';

    // Generate token
    const resetToken = require('crypto').randomBytes(3).toString('hex').toUpperCase();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save token
    await supabase
      .from(table)
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString()
      })
      .eq('id', user.id);

    // Dispatch email with reset token using reliable EmailService (with Ethereal preview fallback)
    let previewUrl = null;
    try {
      const emailResult = await emailService.sendPasswordResetEmail(
        user.email,
        user.first_name || 'User',
        resetToken,
        type
      );
      if (emailResult.success && emailResult.previewUrl) {
        previewUrl = emailResult.previewUrl;
      }

      await appsScript.sendPasswordResetLink({
        email: user.email,
        firstName: user.first_name || 'User',
        resetToken: resetToken,
        type: type // 'student' or 'staff'
      });
      console.log(`Password reset email dispatched to ${user.email} via Apps Script`);
    } catch (emailError) {
      console.error('Failed to dispatch reset email:', emailError);
      // We don't throw here to avoid revealing user existence if it failed later
    }

    res.status(200).json({
      success: true,
      message: `Password reset instructions have been sent to ${maskedEmail}`,
      data: { maskedEmail, previewUrl }
    });
  })
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required').trim(),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    body('type').isIn(['student', 'staff']).withMessage('Valid user type is required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { token, newPassword, type } = req.body;
    const table = type === 'student' ? 'student_profiles' : 'profiles';

    // Find user with matching token
    const { data: user, error } = await supabase
      .from(table)
      .select('id, password_reset_expires')
      .eq('password_reset_token', token.trim().toUpperCase())
      .single();

    if (error || !user) {
      throw new AppError('Invalid or expired password reset token', 400);
    }

    // Check expiration
    if (user.password_reset_expires && new Date(user.password_reset_expires) < new Date()) {
      throw new AppError('Password reset token has expired', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear token fields
    const { error: updateError } = await supabase
      .from(table)
      .update({
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
        is_first_login: false
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Reset password update error:', updateError);
      throw new AppError('Failed to reset password', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Password has been successfully reset. You can now login.'
    });
  })
);

module.exports = router;