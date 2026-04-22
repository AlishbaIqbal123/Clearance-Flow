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

    // Find user in profiles table
    console.log('Login attempt for:', email);
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*, department:department_id(*)')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      if (error) console.error('Staff login DB error:', error);
      else console.log('Staff login failed: User not found for email:', email);
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login (Disabled: column does not exist in current schema)
    /*
    await supabase
      .from('profiles')
      .update({ last_login: new Date() })
      .eq('id', user.id);
    */

    // Create user response object
    const userResponse = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar_url,
      phone: user.phone,
      isFirstLogin: user.is_first_login,
      userType: 'staff'
    };

    const token = generateToken({ 
      id: user.id, 
      userType: 'staff',
      role: user.role 
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

    let query = supabase
      .from('student_profiles')
      .select('*, department:department_id(*)');

    if (registrationNumber) {
      query = query.eq('registration_number', registrationNumber.toUpperCase());
    } else if (email) {
      query = query.eq('email', email.toLowerCase());
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

    // Update last login (Disabled: column does not exist in current schema)
    /*
    await supabase
      .from('student_profiles')
      .update({ last_login: new Date() })
      .eq('id', student.id);
    */

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
    body('email').isEmail().withMessage('Valid email is required'),
    body('type').isIn(['student', 'staff']).withMessage('Valid user type is required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { email, type } = req.body;
    const table = type === 'student' ? 'student_profiles' : 'profiles';

    // Find user
    const { data: user } = await supabase
      .from(table)
      .select('id, first_name')
      .eq('email', email.toLowerCase())
      .single();

    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a reset link will be sent.'
      });
    }

    // Generate token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save token
    await supabase
      .from(table)
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires
      })
      .eq('id', user.id);

    // TODO: Send email with reset token
    // appsScript.sendPasswordResetEmail(email, resetToken, user.first_name);

    res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a reset link will be sent.'
    });
  })
);

module.exports = router;