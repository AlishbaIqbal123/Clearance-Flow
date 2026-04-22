/**
 * User Routes
 * Handles user profile and management operations
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const supabase = require('../config/supabase');
const { authenticate, authorize, studentOnly, staffOnly } = require('../middleware/auth.middleware');
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
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.userType;
  
  let user;
  if (userType === 'student') {
    const { data: student } = await supabase
      .from('student_profiles')
      .select('*, department:department_id(name, code, contact_info)')
      .eq('id', userId)
      .single();
    user = student;
  } else {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, department:department_id(name, code, contact_info)')
      .eq('id', userId)
      .single();
    user = profile;
  }
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    data: {
      user: {
        ...user,
        userType
      }
    }
  });
}));

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile',
  [
    body('phone')
      .optional()
      .matches(/^\+?[\d\s-()]+$/)
      .withMessage('Invalid phone number'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.userType;
    
    const updates = {};
    if (req.body.phone !== undefined) {
      updates.phone = req.body.phone;
      updates.phone_number = req.body.phone;
    }
    if (req.body.avatar !== undefined) updates.avatar_url = req.body.avatar;
    
    let user;
    if (userType === 'student') {
      const { data } = await supabase
        .from('student_profiles')
        .update(updates)
        .eq('id', userId)
        .select('*, department:department_id(name, code)')
        .single();
      user = data;
    } else {
      const { data } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('*, department:department_id(name, code)')
        .single();
      user = data;
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  })
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change password
 * @access  Private
 */
router.put('/change-password',
  [
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    
    // Supabase Auth handles password change
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
      data: {
        requiresRelogin: true
      }
    });
  })
);

/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', asyncHandler(async (req, res) => {
  // TODO: Implement notification system
  // For now, return empty array
  
  res.status(200).json({
    success: true,
    data: {
      notifications: [],
      unreadCount: 0
    }
  });
}));

/**
 * @route   PUT /api/users/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:id/read', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // TODO: Implement notification system
  
  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
}));

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity log
 * @access  Private
 */
router.get('/activity', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.userType;
  const { page = 1, limit = 20 } = req.query;
  
  // TODO: Implement activity logging system
  // For now, return sample data
  
  const activities = [
    {
      action: 'login',
      timestamp: new Date(Date.now() - 3600000),
      details: 'User logged in'
    },
    {
      action: 'profile_update',
      timestamp: new Date(Date.now() - 86400000),
      details: 'Profile information updated'
    }
  ];
  
  res.status(200).json({
    success: true,
    data: {
      activities,
      pagination: {
        total: activities.length,
        page: parseInt(page),
        pages: 1
      }
    }
  });
}));

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin only)
 * @access  Admin
 */
router.get('/:id',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    let { data: user } = await supabase
      .from('profiles')
      .select('*, department:department_id(name, code)')
      .eq('id', id)
      .single();
    
    if (!user) {
      const { data: student } = await supabase
        .from('student_profiles')
        .select('*, department:department_id(name, code)')
        .eq('id', id)
        .single();
      user = student;
    }
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    res.status(200).json({
      success: true,
      data: { user }
    });
  })
);

module.exports = router;