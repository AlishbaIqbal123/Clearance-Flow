# Google Apps Script Integration Guide
## University Clearance Management System - Email Automation

This guide provides comprehensive instructions for setting up Google Apps Script to automate university email operations, including student email creation, password management, and notification systems.

---

## Table of Contents
1. [Overview](#overview)
2. [Setup](#setup)
3. [Student Email Automation](#student-email-automation)
4. [Staff Email Management](#staff-email-management)
5. [Notification System](#notification-system)
6. [Integration with Clearance System](#integration-with-clearance-system)
7. [Deployment](#deployment)
8. [Security Considerations](#security-considerations)

---

## Overview

Google Apps Script enables automation of Google Workspace operations for the university:

- **Student Email Creation**: Automatically create @student.university.edu.pk emails
- **Email Aliases**: Set up university email aliases
- **Group Management**: Create class/department groups
- **Automated Notifications**: Send clearance status notifications
- **Password Management**: Handle password resets and notifications

---

## Setup

### 1. Create Google Apps Script Project

1. Go to [https://script.google.com](https://script.google.com)
2. Sign in with your university Google Workspace admin account
3. Click "New Project"
4. Name it "University Clearance Email System"

### 2. Enable Required APIs

In the Apps Script project:

1. Click on **Services** (+ icon)
2. Add these services:
   - **Admin SDK** (for user management)
   - **Gmail API** (for sending emails)
   - **Google Sheets API** (for logging)

### 3. Set Up OAuth Scopes

In `appsscript.json` (Project Settings > Script Properties):

```json
{
  "timeZone": "Asia/Karachi",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "AdminDirectory",
        "serviceId": "admin",
        "version": "directory_v1"
      }
    ]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/admin.directory.user",
    "https://www.googleapis.com/auth/admin.directory.group",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.external_request"
  ],
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

---

## Student Email Automation

### Main Script: Student Email Manager

```javascript
// Code.gs - Main Entry Point

/**
 * Configuration
 */
const CONFIG = {
  DOMAIN: 'student.university.edu.pk',
  ADMIN_EMAIL: 'admin@university.edu.pk',
  DEFAULT_PASSWORD_LENGTH: 12,
  SHEET_ID: 'your-google-sheet-id-for-logging',
  BATCH_SIZE: 50
};

/**
 * Web API Endpoint for External Systems
 * Deploy as Web App (Execute as: Me, Access: Anyone)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'createStudentEmail':
        return createStudentEmail(data);
      case 'bulkCreateStudentEmails':
        return bulkCreateStudentEmails(data);
      case 'resetPassword':
        return resetStudentPassword(data);
      case 'disableAccount':
        return disableStudentAccount(data);
      case 'sendNotification':
        return sendNotification(data);
      default:
        return jsonResponse({ success: false, error: 'Unknown action' }, 400);
    }
  } catch (error) {
    console.error('Error:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

function doGet(e) {
  return jsonResponse({ 
    status: 'OK', 
    message: 'University Email System API',
    version: '1.0.0'
  });
}

function jsonResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHttpStatus(statusCode);
}
```

### Student Email Creation

```javascript
/**
 * Create Student Email Account
 * @param {Object} data - Student data
 * @returns {Object} Result
 */
function createStudentEmail(data) {
  const {
    registrationNumber,
    firstName,
    lastName,
    personalEmail,
    department,
    batch
  } = data;

  // Generate email address
  const email = generateStudentEmail(registrationNumber);
  
  // Generate temporary password
  const tempPassword = generateSecurePassword();
  
  // Create user object
  const user = {
    primaryEmail: email,
    name: {
      givenName: firstName,
      familyName: lastName
    },
    password: tempPassword,
    changePasswordAtNextLogin: true,
    includeInGlobalAddressList: false,
    orgUnitPath: `/Students/${batch}/${department}`,
    emails: [
      {
        address: email,
        primary: true
      },
      {
        address: personalEmail,
        type: 'home'
      }
    ],
    externalIds: [
      {
        value: registrationNumber,
        type: 'custom',
        customType: 'registration_number'
      }
    ],
    organizations: [
      {
        name: department,
        type: 'school',
        primary: true
      }
    ]
  };

  try {
    // Create user in Google Workspace
    const createdUser = AdminDirectory.Users.insert(user);
    
    // Add to department group
    addToDepartmentGroup(email, department, batch);
    
    // Log creation
    logAction('CREATE_STUDENT', {
      email,
      registrationNumber,
      department,
      batch,
      timestamp: new Date()
    });
    
    // Send welcome email
    sendWelcomeEmail(personalEmail, email, tempPassword, firstName);
    
    return {
      success: true,
      data: {
        email,
        temporaryPassword: tempPassword,
        userId: createdUser.id
      }
    };
    
  } catch (error) {
    console.error('Error creating student email:', error);
    
    // Log error
    logAction('CREATE_STUDENT_ERROR', {
      email,
      registrationNumber,
      error: error.message
    });
    
    throw new Error(`Failed to create email: ${error.message}`);
  }
}

/**
 * Generate Student Email Address
 * Format: fa20-bcs-001@student.university.edu.pk
 */
function generateStudentEmail(registrationNumber) {
  const cleanReg = registrationNumber.toLowerCase().trim();
  return `${cleanReg}@${CONFIG.DOMAIN}`;
}

/**
 * Generate Secure Password
 */
function generateSecurePassword(length = CONFIG.DEFAULT_PASSWORD_LENGTH) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$%^&*';
  
  const all = uppercase + lowercase + numbers + special;
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining length
  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
```

### Bulk Email Creation

```javascript
/**
 * Bulk Create Student Emails from CSV
 */
function bulkCreateStudentEmails(data) {
  const { students } = data;
  const results = {
    success: [],
    failed: []
  };

  // Process in batches
  for (let i = 0; i < students.length; i += CONFIG.BATCH_SIZE) {
    const batch = students.slice(i, i + CONFIG.BATCH_SIZE);
    
    batch.forEach(student => {
      try {
        const result = createStudentEmail(student);
        results.success.push({
          registrationNumber: student.registrationNumber,
          email: result.data.email
        });
      } catch (error) {
        results.failed.push({
          registrationNumber: student.registrationNumber,
          error: error.message
        });
      }
    });
    
    // Add delay between batches
    if (i + CONFIG.BATCH_SIZE < students.length) {
      Utilities.sleep(1000);
    }
  }

  // Send summary email to admin
  sendBulkCreationSummary(results);

  return {
    success: true,
    data: {
      totalProcessed: students.length,
      successful: results.success.length,
      failed: results.failed.length,
      results
    }
  };
}

/**
 * Process CSV Upload (for Google Sheets interface)
 */
function processCSVFromSheet() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Uploads');
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  const students = [];
  for (let i = 1; i < data.length; i++) {
    students.push({
      registrationNumber: data[i][0],
      firstName: data[i][1],
      lastName: data[i][2],
      personalEmail: data[i][3],
      department: data[i][4],
      batch: data[i][5]
    });
  }
  
  return bulkCreateStudentEmails({ students });
}
```

### Group Management

```javascript
/**
 * Add Student to Department Group
 */
function addToDepartmentGroup(studentEmail, department, batch) {
  const groupEmail = `${department.toLowerCase()}-${batch}@${CONFIG.DOMAIN}`;
  
  try {
    // Check if group exists
    try {
      AdminDirectory.Groups.get(groupEmail);
    } catch (e) {
      // Create group if doesn't exist
      AdminDirectory.Groups.insert({
        email: groupEmail,
        name: `${department} ${batch}`,
        description: `${department} Department - Batch ${batch}`
      });
    }
    
    // Add member to group
    AdminDirectory.Members.insert({
      email: studentEmail,
      role: 'MEMBER'
    }, groupEmail);
    
  } catch (error) {
    console.error('Error adding to group:', error);
  }
}

/**
 * Create Department Groups
 */
function createDepartmentGroups(departments, batches) {
  const results = [];
  
  departments.forEach(dept => {
    batches.forEach(batch => {
      const groupEmail = `${dept.toLowerCase()}-${batch}@${CONFIG.DOMAIN}`;
      
      try {
        AdminDirectory.Groups.insert({
          email: groupEmail,
          name: `${dept} ${batch}`,
          description: `${dept} Department - Batch ${batch}`
        });
        
        results.push({ groupEmail, status: 'created' });
      } catch (error) {
        if (error.message.includes('already exists')) {
          results.push({ groupEmail, status: 'already_exists' });
        } else {
          results.push({ groupEmail, status: 'error', error: error.message });
        }
      }
    });
  });
  
  return results;
}
```

---

## Staff Email Management

```javascript
/**
 * Create Staff Email Account
 */
function createStaffEmail(data) {
  const {
    firstName,
    lastName,
    email,
    role,
    department,
    phone
  } = data;

  const tempPassword = generateSecurePassword();
  
  const user = {
    primaryEmail: email,
    name: {
      givenName: firstName,
      familyName: lastName
    },
    password: tempPassword,
    changePasswordAtNextLogin: true,
    includeInGlobalAddressList: true,
    orgUnitPath: `/Staff/${department}`,
    phones: [
      {
        value: phone,
        type: 'work'
      }
    ],
    organizations: [
      {
        name: department,
        title: role,
        type: 'school',
        primary: true
      }
    ]
  };

  try {
    const createdUser = AdminDirectory.Users.insert(user);
    
    // Add to staff group
    addToStaffGroup(email, department);
    
    // Send welcome email
    sendStaffWelcomeEmail(email, tempPassword, firstName, role);
    
    return {
      success: true,
      data: {
        email,
        temporaryPassword: tempPassword,
        userId: createdUser.id
      }
    };
    
  } catch (error) {
    console.error('Error creating staff email:', error);
    throw new Error(`Failed to create staff email: ${error.message}`);
  }
}

/**
 * Add to Staff Group
 */
function addToStaffGroup(email, department) {
  const groupEmail = `${department.toLowerCase()}-staff@university.edu.pk`;
  
  try {
    AdminDirectory.Members.insert({
      email: email,
      role: 'MEMBER'
    }, groupEmail);
  } catch (error) {
    console.error('Error adding to staff group:', error);
  }
}
```

---

## Notification System

### Email Templates

```javascript
/**
 * Email Templates
 */
const EMAIL_TEMPLATES = {
  STUDENT_WELCOME: {
    subject: 'Welcome to University - Your Student Email Account',
    body: (firstName, email, password) => `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to University, ${firstName}!</h2>
          
          <p>Your student email account has been created successfully.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email Address:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
          </div>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Login at <a href="https://mail.google.com">https://mail.google.com</a></li>
            <li>Change your password on first login</li>
            <li>Set up your profile</li>
            <li>Download the Gmail app on your phone</li>
          </ol>
          
          <p><strong>Important:</strong> This password is temporary. You must change it on your first login.</p>
          
          <p>If you have any issues, contact IT Support at support@university.edu.pk</p>
          
          <p>Best regards,<br>University IT Department</p>
        </body>
      </html>
    `
  },
  
  CLEARANCE_STATUS_UPDATE: {
    subject: 'Clearance Request Status Update',
    body: (firstName, requestId, status, department, remarks) => `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Clearance Status Update</h2>
          
          <p>Dear ${firstName},</p>
          
          <p>Your clearance request <strong>${requestId}</strong> has been updated:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Status:</strong> ${status}</p>
            ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
          </div>
          
          <p>Login to the clearance portal to view details: 
            <a href="https://clearance.university.edu.pk">Clearance Portal</a>
          </p>
          
          <p>Best regards,<br>University Administration</p>
        </body>
      </html>
    `
  },
  
  CERTIFICATE_ISSUED: {
    subject: 'Clearance Certificate Issued',
    body: (firstName, certificateNumber) => `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Congratulations, ${firstName}!</h2>
          
          <p>Your clearance certificate has been issued.</p>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Certificate Number:</strong> ${certificateNumber}</p>
          </div>
          
          <p>You can download your certificate from the clearance portal.</p>
          
          <p>Best wishes for your future endeavors!</p>
          
          <p>University Administration</p>
        </body>
      </html>
    `
  },
  
  PASSWORD_RESET: {
    subject: 'Password Reset - University Account',
    body: (firstName, resetLink) => `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Password Reset Request</h2>
          
          <p>Dear ${firstName},</p>
          
          <p>We received a request to reset your password.</p>
          
          <p>Click the link below to reset your password:</p>
          
          <a href="${resetLink}" style="display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
          
          <p style="margin-top: 20px;">If you didn't request this, please ignore this email.</p>
          
          <p>Best regards,<br>University IT Department</p>
        </body>
      </html>
    `
  }
};
```

### Email Sending Functions

```javascript
/**
 * Send Welcome Email to Student
 */
function sendWelcomeEmail(personalEmail, studentEmail, password, firstName) {
  const template = EMAIL_TEMPLATES.STUDENT_WELCOME;
  
  GmailApp.sendEmail(
    personalEmail,
    template.subject,
    '',
    {
      htmlBody: template.body(firstName, studentEmail, password),
      from: CONFIG.ADMIN_EMAIL,
      name: 'University IT Department',
      replyTo: 'support@university.edu.pk'
    }
  );
}

/**
 * Send Staff Welcome Email
 */
function sendStaffWelcomeEmail(email, password, firstName, role) {
  const subject = 'Welcome to University - Your Staff Email Account';
  
  const body = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to University, ${firstName}!</h2>
        
        <p>Your staff email account has been created for your role as ${role}.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email Address:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
        </div>
        
        <p>Please change your password on first login.</p>
        
        <p>Best regards,<br>University HR Department</p>
      </body>
    </html>
  `;
  
  GmailApp.sendEmail(email, subject, '', {
    htmlBody: body,
    from: CONFIG.ADMIN_EMAIL,
    name: 'University HR Department'
  });
}

/**
 * Send Clearance Status Update
 */
function sendClearanceNotification(data) {
  const { studentEmail, firstName, requestId, status, department, remarks } = data;
  
  const template = EMAIL_TEMPLATES.CLEARANCE_STATUS_UPDATE;
  
  GmailApp.sendEmail(
    studentEmail,
    template.subject,
    '',
    {
      htmlBody: template.body(firstName, requestId, status, department, remarks),
      from: CONFIG.ADMIN_EMAIL,
      name: 'University Clearance System'
    }
  );
  
  // Log notification
  logAction('SEND_NOTIFICATION', {
    type: 'clearance_status',
    recipient: studentEmail,
    requestId,
    status,
    timestamp: new Date()
  });
}

/**
 * Send Certificate Issued Notification
 */
function sendCertificateNotification(studentEmail, firstName, certificateNumber) {
  const template = EMAIL_TEMPLATES.CERTIFICATE_ISSUED;
  
  GmailApp.sendEmail(
    studentEmail,
    template.subject,
    '',
    {
      htmlBody: template.body(firstName, certificateNumber),
      from: CONFIG.ADMIN_EMAIL,
      name: 'University Clearance System'
    }
  );
}

/**
 * Send Bulk Notification
 */
function sendBulkNotification(data) {
  const { recipients, subject, message, fromName = 'University' } = data;
  
  const batchSize = 100; // Gmail daily limit consideration
  const results = { sent: 0, failed: 0 };
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    batch.forEach(recipient => {
      try {
        GmailApp.sendEmail(recipient, subject, '', {
          htmlBody: message,
          from: CONFIG.ADMIN_EMAIL,
          name: fromName
        });
        results.sent++;
      } catch (error) {
        console.error(`Failed to send to ${recipient}:`, error);
        results.failed++;
      }
    });
    
    // Add delay between batches
    if (i + batchSize < recipients.length) {
      Utilities.sleep(1000);
    }
  }
  
  return results;
}
```

---

## Integration with Clearance System

### API Endpoint for Clearance System

```javascript
/**
 * Handle requests from Clearance System
 */
function handleClearanceSystemRequest(data) {
  const { type, payload } = data;
  
  switch(type) {
    case 'STUDENT_REGISTERED':
      return createStudentEmail(payload);
      
    case 'CLEARANCE_STATUS_CHANGED':
      return sendClearanceNotification({
        studentEmail: payload.studentEmail,
        firstName: payload.firstName,
        requestId: payload.requestId,
        status: payload.status,
        department: payload.department,
        remarks: payload.remarks
      });
      
    case 'CERTIFICATE_ISSUED':
      return sendCertificateNotification(
        payload.studentEmail,
        payload.firstName,
        payload.certificateNumber
      );
      
    case 'BULK_NOTIFICATION':
      return sendBulkNotification(payload);
      
    default:
      return { success: false, error: 'Unknown notification type' };
  }
}
```

### Backend Integration (Node.js)

```javascript
// services/email.service.js
const { google } = require('googleapis');

class EmailService {
  constructor() {
    this.appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  }

  async notifyClearanceStatus(student, request, statusUpdate) {
    const payload = {
      type: 'CLEARANCE_STATUS_CHANGED',
      payload: {
        studentEmail: student.email,
        firstName: student.firstName,
        requestId: request.requestId,
        status: statusUpdate.status,
        department: statusUpdate.department,
        remarks: statusUpdate.remarks
      }
    };

    return this.callAppsScript(payload);
  }

  async notifyCertificateIssued(student, certificate) {
    const payload = {
      type: 'CERTIFICATE_ISSUED',
      payload: {
        studentEmail: student.email,
        firstName: student.firstName,
        certificateNumber: certificate.certificateNumber
      }
    };

    return this.callAppsScript(payload);
  }

  async createStudentEmail(studentData) {
    const payload = {
      type: 'STUDENT_REGISTERED',
      payload: studentData
    };

    return this.callAppsScript(payload);
  }

  async callAppsScript(payload) {
    try {
      const response = await fetch(this.appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return await response.json();
    } catch (error) {
      console.error('Apps Script call failed:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
```

---

## Deployment

### 1. Deploy as Web App

1. In Apps Script, click **Deploy > New deployment**
2. Select type: **Web app**
3. Configure:
   - **Description**: "University Email System API v1"
   - **Execute as**: Me (your admin account)
   - **Who has access**: Anyone (or restrict by domain)
4. Click **Deploy**
5. Copy the Web App URL

### 2. Add URL to Environment Variables

```env
# Backend .env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 3. Set Up Triggers (Optional)

For scheduled tasks:

```javascript
/**
 * Create time-driven triggers
 */
function createTriggers() {
  // Daily cleanup at 3 AM
  ScriptApp.newTrigger('dailyCleanup')
    .timeBased()
    .everyDays(1)
    .atHour(3)
    .create();
  
  // Weekly report every Monday at 9 AM
  ScriptApp.newTrigger('sendWeeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();
}
```

---

## Security Considerations

### 1. API Key Authentication

Add API key validation to your web app:

```javascript
function doPost(e) {
  const apiKey = e.parameter.apiKey;
  
  if (apiKey !== CONFIG.API_KEY) {
    return jsonResponse({ success: false, error: 'Invalid API key' }, 401);
  }
  
  // Process request...
}
```

### 2. IP Whitelisting

```javascript
function validateIP() {
  const allowedIPs = ['123.45.67.89', '98.76.54.32']; // Your server IPs
  const clientIP = Session.getActiveUser().getEmail(); // Or use actual IP detection
  
  // Additional validation logic
}
```

### 3. Request Logging

```javascript
function logAction(action, details) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Logs');
  
  sheet.appendRow([
    new Date(),
    action,
    JSON.stringify(details),
    Session.getActiveUser().getEmail()
  ]);
}
```

### 4. Rate Limiting

```javascript
function checkRateLimit(identifier) {
  const cache = CacheService.getScriptCache();
  const key = `rate_limit_${identifier}`;
  const count = cache.get(key) || 0;
  
  if (count > 100) { // 100 requests per hour
    throw new Error('Rate limit exceeded');
  }
  
  cache.put(key, parseInt(count) + 1, 3600); // 1 hour expiry
}
```

---

## Monitoring & Maintenance

### Daily Cleanup Function

```javascript
function dailyCleanup() {
  // Remove expired password reset tokens
  // Archive old logs
  // Check for failed email deliveries
  // Send daily summary to admin
}
```

### Weekly Report

```javascript
function sendWeeklyReport() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const logsSheet = sheet.getSheetByName('Logs');
  
  // Generate report
  const report = generateWeeklyStats(logsSheet);
  
  // Email to admin
  GmailApp.sendEmail(
    CONFIG.ADMIN_EMAIL,
    'Weekly Email System Report',
    '',
    { htmlBody: report }
  );
}
```

---

*Last Updated: April 2024*