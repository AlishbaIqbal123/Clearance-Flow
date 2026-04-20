/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Supabase/PostgreSQL Errors
 */
const handleSupabaseError = (err) => {
  // PostgreSQL error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (err.code === '23505') { // unique_violation
    return new AppError('Record already exists. Please use different data.', 409, 'DUPLICATE_ERROR');
  }
  if (err.code === '23503') { // foreign_key_violation
    return new AppError('Reference error: Parent record not found.', 400, 'REFERENCE_ERROR');
  }
  if (err.code === '42P01') { // undefined_table
    return new AppError('Internal database configuration error.', 500, 'DB_CONFIG_ERROR');
  }
  return new AppError(err.message, 400, 'DATABASE_ERROR');
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401, 'JWT_ERROR');
};

/**
 * Handle JWT Expiration Errors
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401, 'JWT_EXPIRED');
};

/**
 * Handle Multer Errors
 */
const handleMulterError = (err) => {
  let message = 'File upload error';
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File size too large. Maximum size is 5MB.';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Unexpected file field.';
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    message = 'Too many files uploaded.';
  }
  
  return new AppError(message, 400, 'UPLOAD_ERROR');
};

/**
 * Main Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  let error = { ...err };
  error.message = err.message;

  // Supabase/Postgres Errors
  if (err.code || err.details) {
    error = handleSupabaseError(err);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Multer Errors
  if (err.name === 'MulterError') {
    error = handleMulterError(err);
  }

  // Send response
  const response = {
    success: false,
    status: error.status,
    statusCode: error.statusCode,
    message: error.message,
    errorCode: error.errorCode,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  };

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    response.message = 'Something went wrong!';
    response.errorCode = 'INTERNAL_ERROR';
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not Found Error Handler
 * For routes that don't exist
 */
const notFound = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFound
};