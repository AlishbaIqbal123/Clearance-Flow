/**
 * Authentication & Authorization Middleware
 * Handles JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT Token
 * @param {Object} payload - Data to encode in token
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'university-clearance-system',
    audience: 'university-clearance-users'
  });
};

/**
 * Verify JWT Token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Find user based on type
    let user;
    if (decoded.userType === 'student') {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*, department:department_id(*)')
        .eq('id', decoded.id)
        .single();
      user = data;
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, department:department_id(*)')
        .eq('id', decoded.id)
        .single();
      user = data;
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.'
      });
    }
    
    // Fix: DB uses snake_case is_active
    if (user.is_active === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }
    
    // Attach user info to request — include department_id for dept-scoped queries
    req.user = {
      id: user.id,
      email: user.email,
      role: decoded.userType === 'student' ? 'student' : user.role,
      userType: decoded.userType,
      department: user.department || null,
      department_id: user.department_id || user.department?.id || null,
      firstName: user.first_name || user.firstName,
      lastName: user.last_name || user.lastName,
      fullName: user.full_name || `${user.first_name} ${user.last_name}`
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    let user;
    if (decoded.userType === 'student') {
      const { data } = await supabase
        .from('student_profiles')
        .select('*, department:department_id(*)')
        .eq('id', decoded.id)
        .single();
      user = data;
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('*, department:department_id(*)')
        .eq('id', decoded.id)
        .single();
      user = data;
    }
    
    if (user && user.is_active !== false) {
      req.user = {
        id: user.id,
        email: user.email,
        role: decoded.userType === 'student' ? 'student' : user.role,
        userType: decoded.userType,
        department: user.department || null,
        department_id: user.department_id || user.department?.id || null,
        firstName: user.first_name || user.firstName,
        lastName: user.last_name || user.lastName,
        fullName: user.full_name || `${user.first_name} ${user.last_name}`
      };
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

/**
 * Role-based Authorization Middleware
 * @param {...String} allowedRoles - Roles allowed to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Department Access Middleware
 * Ensures user has access to specific department
 */
const requireDepartmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  // Admin can access all departments
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Check if user belongs to a department
  if (!req.user.department) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. No department assigned.'
    });
  }
  
  // If department ID is in params, verify access
  if (req.params.departmentId) {
    if (req.user.department?.id !== req.params.departmentId && req.user.department?._id?.toString() !== req.params.departmentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own department.'
      });
    }
  }
  
  next();
};

/**
 * Student-only Middleware
 * Ensures only students can access the route
 */
const studentOnly = (req, res, next) => {
  if (!req.user || req.user.userType !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Students only.'
    });
  }
  
  next();
};

/**
 * Staff-only Middleware
 * Ensures only staff (non-students) can access the route
 */
const staffOnly = (req, res, next) => {
  if (!req.user || req.user.userType === 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff only.'
    });
  }
  
  next();
};

/**
 * Admin-only Middleware
 * Ensures only admins can access the route
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  
  next();
};

/**
 * HOD-only Middleware
 * Ensures only HODs can access the route
 */
const hodOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'hod')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. HOD or Admin only.'
    });
  }
  
  next();
};

/**
 * Resource Ownership Middleware
 * Ensures user can only access their own resources (for students)
 */
const requireOwnership = (paramName = 'studentId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    // Admins and staff can access any resource
    if (req.user.userType !== 'student') {
      return next();
    }
    
    // Students can only access their own resources
    const resourceId = req.params[paramName];
    if (resourceId && resourceId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  optionalAuth,
  authorize,
  requireDepartmentAccess,
  studentOnly,
  staffOnly,
  adminOnly,
  hodOnly,
  requireOwnership
};