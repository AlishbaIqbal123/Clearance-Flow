/**
 * Communication Routes
 * Handles messaging, notifications, and contact functionality
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const supabase = require('../config/supabase');
const appsScript = require('../services/appsScript.service');
const { authenticate, studentOnly, staffOnly } = require('../middleware/auth.middleware');
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
 * @route   GET /api/communication/departments/:id/contact
 * @desc    Get department contact information
 * @access  Authenticated
 */
router.get('/departments/:id/contact', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { data: department, error } = await supabase
    .from('departments')
    .select('name, code, contact_info, location, office_hours, head:head_id(first_name, last_name, email, phone)')
    .eq('id', id)
    .single();
  
  if (!department || error) {
    throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
  }
  
  // Generate WhatsApp link if phone number exists
  let whatsappLink = null;
  const contactInfo = department.contact_info;
  if (contactInfo?.whatsapp) {
    const cleanNumber = contactInfo.whatsapp.replace(/\D/g, '');
    whatsappLink = `https://wa.me/${cleanNumber}`;
  } else if (contactInfo?.phone) {
    const cleanNumber = contactInfo.phone.replace(/\D/g, '');
    whatsappLink = `https://wa.me/${cleanNumber}`;
  }
  
  // Generate links
  const emailLink = contactInfo?.email ? `mailto:${contactInfo.email}` : null;
  const phoneLink = contactInfo?.phone ? `tel:${contactInfo.phone}` : null;
  
  res.status(200).json({
    success: true,
    data: {
      department: {
        name: department.name,
        code: department.code,
        contactInfo,
        location: department.location,
        officeHours: department.office_hours,
        head: department.head
      },
      links: {
        whatsapp: whatsappLink,
        email: emailLink,
        phone: phoneLink
      }
    }
  });
}));

/**
 * @route   POST /api/communication/contact-department
 * @desc    Send message to department (student to department)
 * @access  Student
 */
router.post('/contact-department',
  studentOnly,
  [
    body('departmentId').isUUID().withMessage('Valid department ID required'),
    body('message')
      .trim()
      .notEmpty()
      .isLength({ max: 2000 })
      .withMessage('Message is required and cannot exceed 2000 characters'),
    body('subject')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Subject cannot exceed 200 characters'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { departmentId, message, subject, requestId } = req.body;
    const studentId = req.user.id;
    
    // Verify department exists
    const { data: department } = await supabase.from('departments').select('name, contact_info').eq('id', departmentId).single();
    if (!department) {
      throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    }
    
    // If requestId provided, verify it belongs to student
    if (requestId) {
      const { data: request } = await supabase
        .from('clearance_requests')
        .select('comments')
        .eq('id', requestId)
        .eq('student_id', studentId)
        .single();
      
      if (!request) {
        throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
      }
      
      const comments = request.comments || [];
      comments.push({
        author_id: studentId,
        author_name: req.user.fullName,
        message: `[${subject || 'General Inquiry'}] ${message}`,
        is_internal: false,
        created_at: new Date().toISOString()
      });

      await supabase.from('clearance_requests').update({ comments }).eq('id', requestId);
    }
    
    // Emit notification
    const io = req.app.get('io');
    if (io) {
      io.to(`dept:${departmentId}`).emit('new-student-message', {
        studentId,
        studentName: req.user.fullName,
        subject: subject || 'General Inquiry',
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        sentAt: new Date().toISOString(),
        department: {
          name: department.name,
          email: department.contact_info?.email
        }
      }
    });
  })
);

/**
 * @route   POST /api/communication/bulk-notify
 * @desc    Send bulk notification to students
 * @access  Admin
 */
router.post('/bulk-notify',
  [
    body('recipients')
      .isIn(['all', 'by_department', 'by_status', 'specific'])
      .withMessage('Invalid recipients type'),
    body('message')
      .trim()
      .notEmpty()
      .isLength({ max: 2000 })
      .withMessage('Message is required and cannot exceed 2000 characters'),
    body('channels')
      .isArray({ min: 1 })
      .withMessage('At least one channel is required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { recipients, recipientIds, message, subject, channels, filters } = req.body;
    
    let query = supabase.from('student_profiles').select('email, phone, first_name').eq('is_active', true);
    
    if (recipients === 'by_department' && filters?.department) query = query.eq('department_id', filters.department);
    if (recipients === 'by_status' && filters?.clearanceStatus) query = query.eq('clearance_status', filters.clearanceStatus);
    if (recipients === 'specific' && recipientIds) query = query.in('id', recipientIds);
    
    const { data: students } = await query;
    
    const results = {
      total: students?.length || 0,
      email: { sent: 0, failed: 0 },
      push: { sent: 0, failed: 0 }
    };
    
    if (students) {
      if (channels.includes('email')) {
        const emails = students.map(s => s.email);
        await appsScript.sendBulkNotification({
          recipients: emails,
          subject: subject || 'University Notification',
          message: message,
          fromName: 'University Administration'
        });
        results.email.sent = emails.length;
      }
      
      for (const student of students) {
        if (channels.includes('push')) results.push.sent++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Notifications processing initiated for ${results.total} students`,
      data: { results }
    });
  })
);

/**
 * @route   POST /api/communication/send-email
 * @desc    Send email to specific recipient
 * @access  Staff
 */
router.post('/send-email',
  staffOnly,
  [
    body('to').isEmail().withMessage('Valid recipient email required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('body').trim().notEmpty().withMessage('Email body is required'),
    validate
  ],
  asyncHandler(async (req, res) => {
    const { to, subject, body, cc, bcc } = req.body;
    
    // TODO: Implement actual email sending using nodemailer
    // This is a placeholder implementation
    
    const emailData = {
      from: process.env.EMAIL_FROM || 'clearance@university.edu.pk',
      to,
      cc,
      bcc,
      subject,
      html: body,
      sentBy: req.user.id,
      sentAt: new Date()
    };
    
    console.log('Email to be sent:', emailData);
    
    res.status(200).json({
      success: true,
      message: 'Email queued for sending',
      data: {
        recipient: to,
        subject,
        sentAt: emailData.sentAt
      }
    });
  })
);

/**
 * @route   GET /api/communication/whatsapp-link/:departmentId
 * @desc    Generate WhatsApp click-to-chat link
 * @access  Authenticated
 */
router.get('/whatsapp-link/:departmentId', asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  const { message } = req.query;
  
  const { data: department } = await supabase.from('departments').select('name, contact_info').eq('id', departmentId).single();
  
  if (!department) {
    throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
  }
  
  const phoneNumber = department.contact_info?.whatsapp || department.contact_info?.phone;
  
  if (!phoneNumber) {
    throw new AppError('No phone number available for this department', 400, 'NO_PHONE');
  }
  
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  let whatsappUrl = `https://wa.me/${cleanNumber}`;
  
  if (message) {
    const encodedMessage = encodeURIComponent(message);
    whatsappUrl += `?text=${encodedMessage}`;
  }
  
  res.status(200).json({
    success: true,
    data: {
      whatsappUrl,
      department: department.name,
      phoneNumber: cleanNumber
    }
  });
}));

/**
 * @route   POST /api/communication/notify-status-change
 * @desc    Notify student of status change
 * @access  Staff
 */
router.post('/notify-status-change',
  staffOnly,
  asyncHandler(async (req, res) => {
    const { studentId, requestId, status, message, channels = ['email'] } = req.body;
    
    const { data: student } = await supabase.from('student_profiles').select('email, phone').eq('id', studentId).single();
    if (!student) {
      throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    }
    
    const { data: request } = await supabase.from('clearance_requests').select('request_id, notifications_sent').eq('id', requestId).single();
    if (!request) {
      throw new AppError('Clearance request not found', 404, 'REQUEST_NOT_FOUND');
    }
    
    const notifications = [];
    for (const channel of channels) {
      switch (channel) {
        case 'email':
          notifications.push({
            channel: 'email',
            recipient: student.email,
            status: 'queued',
            subject: `Clearance Status Update - ${status}`,
            content: message || `Your clearance request status has been updated to: ${status}`,
            sent_at: new Date().toISOString()
          });
          break;
        case 'push':
          notifications.push({
            channel: 'push',
            recipient: studentId,
            status: 'queued',
            title: 'Clearance Status Update',
            body: `Your request status is now ${status}`,
            sent_at: new Date().toISOString()
          });
          break;
      }
    }
    
    const notificationsSent = request.notifications_sent || [];
    notificationsSent.push(...notifications);
    await supabase.from('clearance_requests').update({ notifications_sent: notificationsSent }).eq('id', requestId);
    
    // Trigger External Notification through Apps Script
    if (channels.includes('email')) {
      await appsScript.sendClearanceNotification({
        studentEmail: student.email,
        firstName: student.first_name || 'Student',
        requestId: request.request_id,
        status: status,
        message: message
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${studentId}`).emit('status-notification', {
        requestId,
        status,
        message: message || `Your clearance request status has been updated to: ${status}`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notifications sent',
      data: { notifications }
    });
  })
);

/**
 * @route   GET /api/communication/templates
 * @desc    Get email/message templates
 * @access  Staff
 */
router.get('/templates', asyncHandler(async (req, res) => {
  // Predefined templates for common communications
  const templates = [
    {
      id: 'status_cleared',
      name: 'Status Cleared',
      subject: 'Clearance Request Approved',
      body: 'Dear {{studentName}},\n\nWe are pleased to inform you that your clearance request ({{requestId}}) has been approved by {{departmentName}}.\n\nBest regards,\n{{departmentName}}'
    },
    {
      id: 'status_rejected',
      name: 'Status Rejected',
      subject: 'Clearance Request Requires Attention',
      body: 'Dear {{studentName}},\n\nYour clearance request ({{requestId}}) requires attention. Reason: {{reason}}\n\nPlease contact {{departmentName}} for more information.\n\nBest regards,\n{{departmentName}}'
    },
    {
      id: 'documents_required',
      name: 'Documents Required',
      subject: 'Additional Documents Required',
      body: 'Dear {{studentName}},\n\nPlease submit the following documents to complete your clearance:\n{{documents}}\n\nBest regards,\n{{departmentName}}'
    },
    {
      id: 'dues_pending',
      name: 'Pending Dues',
      subject: 'Pending Dues Notification',
      body: 'Dear {{studentName}},\n\nYou have pending dues of Rs. {{amount}}. Please clear your dues to proceed with clearance.\n\nBest regards,\n{{departmentName}}'
    },
    {
      id: 'certificate_issued',
      name: 'Certificate Issued',
      subject: 'Clearance Certificate Issued',
      body: 'Dear {{studentName}},\n\nCongratulations! Your clearance certificate ({{certificateNumber}}) has been issued.\n\nYou can download it from your dashboard.\n\nBest regards,\nUniversity Administration'
    }
  ];
  
  res.status(200).json({
    success: true,
    data: { templates }
  });
}));

module.exports = router;