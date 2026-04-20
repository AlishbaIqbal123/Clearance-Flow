# University Clearance Management System
## API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Login (Staff/Admin)
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@university.edu.pk",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "firstName": "System",
      "lastName": "Administrator",
      "email": "admin@university.edu.pk",
      "role": "admin",
      "requiresPasswordChange": false
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

### Login (Student)
```http
POST /auth/student/login
```

**Request Body:**
```json
{
  "registrationNumber": "FA20-BCS-001",
  "password": "FA20-BCS-001"
}
```

### Change Password
```http
POST /auth/change-password
```

**Request Body:**
```json
{
  "currentPassword": "old-password",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@university.edu.pk"
}
```

### Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword@123"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## Admin Endpoints

### Dashboard Statistics
```http
GET /admin/dashboard
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "counts": {
      "totalStudents": 1500,
      "totalDepartments": 8,
      "totalStaff": 25,
      "totalClearanceRequests": 450
    },
    "clearanceStats": {
      "cleared": 320,
      "pending": 80,
      "rejected": 50
    },
    "recentRequests": [...],
    "departmentPendingStats": [...],
    "monthlyTrend": [...]
  }
}
```

### Get All Users (Staff)
```http
GET /admin/users?role=hod&page=1&limit=20
Authorization: Bearer <admin_token>
```

### Create User
```http
POST /admin/users
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu.pk",
  "password": "SecurePass@123",
  "role": "hod",
  "department": "department-id",
  "phone": "+92-300-1234567"
}
```

### Update User
```http
PUT /admin/users/:id
Authorization: Bearer <admin_token>
```

### Delete User (Deactivate)
```http
DELETE /admin/users/:id
Authorization: Bearer <admin_token>
```

### Get All Students
```http
GET /admin/students?department=dept-id&batch=2020&page=1&limit=20
Authorization: Bearer <admin_token>
```

### Create Student
```http
POST /admin/students
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "firstName": "Ali",
  "lastName": "Ahmad",
  "registrationNumber": "FA20-BCS-001",
  "email": "ali.ahmad@student.university.edu.pk",
  "password": "FA20-BCS-001",
  "department": "department-id",
  "program": "BS",
  "discipline": "Computer Science",
  "batch": "2020",
  "phone": "+92-300-1234567"
}
```

### Bulk Import Students (CSV)
```http
POST /admin/students/bulk-import
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `csv`: CSV file with student data

**CSV Format:**
```csv
firstName,lastName,registrationNumber,email,department,program,discipline,batch,phone
Ali,Ahmad,FA20-BCS-001,ali@student.edu.pk,CS,BS,Computer Science,2020,+923001234567
```

### Get All Departments
```http
GET /admin/departments
Authorization: Bearer <admin_token>
```

### Create Department
```http
POST /admin/departments
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Computer Science",
  "code": "CS",
  "type": "academic",
  "description": "Department of Computer Science",
  "contactInfo": {
    "email": "cs@university.edu.pk",
    "phone": "+92-51-1234567",
    "whatsapp": "+92-300-1234567"
  },
  "clearanceConfig": {
    "isRequired": true,
    "order": 1,
    "requiredDocuments": [
      { "name": "No Dues Certificate", "isMandatory": true }
    ]
  }
}
```

---

## Student Endpoints

### Get Profile
```http
GET /students/profile
Authorization: Bearer <student_token>
```

### Update Profile
```http
PUT /students/profile
Authorization: Bearer <student_token>
```

### Get Dashboard
```http
GET /students/dashboard
Authorization: Bearer <student_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": { ... },
    "activeRequest": { ... },
    "clearanceHistory": [...],
    "departments": [...],
    "canSubmitNewRequest": true
  }
}
```

### Get Clearance Status
```http
GET /students/clearance-status
Authorization: Bearer <student_token>
```

### Submit Clearance Request
```http
POST /students/clearance-request
Authorization: Bearer <student_token>
```

**Request Body:**
```json
{
  "requestType": "graduation",
  "reason": "Completing degree",
  "documents": [
    {
      "name": "Transcript",
      "url": "https://...",
      "type": "application/pdf"
    }
  ]
}
```

### Cancel Clearance Request
```http
POST /students/clearance-request/:id/cancel
Authorization: Bearer <student_token>
```

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

### Upload Documents
```http
POST /students/clearance-request/:id/documents
Authorization: Bearer <student_token>
```

**Request Body:**
```json
{
  "documents": [
    {
      "name": "Document Name",
      "url": "https://...",
      "type": "application/pdf"
    }
  ]
}
```

### Add Comment
```http
POST /students/clearance-request/:id/comments
Authorization: Bearer <student_token>
```

**Request Body:**
```json
{
  "message": "I have submitted all required documents."
}
```

### Get Departments (with contact info)
```http
GET /students/departments
Authorization: Bearer <student_token>
```

### Get Clearance History
```http
GET /students/clearance-history?page=1&limit=10
Authorization: Bearer <student_token>
```

---

## Department Staff Endpoints

### Get Dashboard
```http
GET /departments/dashboard
Authorization: Bearer <staff_token>
```

### Get All Requests
```http
GET /departments/requests?status=pending&page=1&limit=20
Authorization: Bearer <staff_token>
```

### Get Single Request
```http
GET /departments/requests/:id
Authorization: Bearer <staff_token>
```

### Update Request Status
```http
PUT /departments/requests/:id/status
Authorization: Bearer <staff_token>
```

**Request Body:**
```json
{
  "status": "cleared",
  "remarks": "All documents verified. No outstanding dues.",
  "dueAmount": 0,
  "checklistUpdates": [
    { "item": "All courses completed", "completed": true }
  ]
}
```

**Status Options:**
- `pending` - Request is pending
- `in_review` - Under review
- `cleared` - Approved/Cleared
- `rejected` - Rejected
- `on_hold` - On hold

### Add Comment
```http
POST /departments/requests/:id/comments
Authorization: Bearer <staff_token>
```

**Request Body:**
```json
{
  "message": "Please submit your fee challan.",
  "isInternal": false
}
```

### Get Department Profile
```http
GET /departments/profile
Authorization: Bearer <staff_token>
```

### Update Department Profile
```http
PUT /departments/profile
Authorization: Bearer <staff_token>
```

### Get Pending Requests Count
```http
GET /departments/pending-requests
Authorization: Bearer <staff_token>
```

---

## Clearance Management Endpoints

### Get All Requests (Admin)
```http
GET /clearance/requests?status=pending&department=dept-id&page=1&limit=20
Authorization: Bearer <admin_token>
```

### Get Request by ID
```http
GET /clearance/requests/:id
Authorization: Bearer <token>
```

### Get Request by Request ID
```http
GET /clearance/requests/by-request-id/CLR-XXXXXX
Authorization: Bearer <admin_token>
```

### Issue Certificate
```http
POST /clearance/requests/:id/issue-certificate
Authorization: Bearer <admin_token>
```

### Get Statistics
```http
GET /clearance/statistics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>
```

### Get Recent Requests
```http
GET /clearance/recent?limit=10
Authorization: Bearer <admin_token>
```

### Get Pending Requests
```http
GET /clearance/pending?page=1&limit=20
Authorization: Bearer <admin_token>
```

### Delete Request
```http
DELETE /clearance/requests/:id
Authorization: Bearer <admin_token>
```

---

## Analytics Endpoints

### Get Overview
```http
GET /analytics/overview?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>
```

### Get Student Analytics
```http
GET /analytics/students?batch=2020&department=dept-id
Authorization: Bearer <admin_token>
```

### Get Department Analytics
```http
GET /analytics/departments
Authorization: Bearer <admin_token>
```

### Get Performance Metrics
```http
GET /analytics/performance?days=30
Authorization: Bearer <admin_token>
```

### Export Data
```http
GET /analytics/export?type=requests&format=json
Authorization: Bearer <admin_token>
```

**Export Types:**
- `requests` - Clearance requests
- `students` - Students
- `departments` - Departments

**Formats:**
- `json` - JSON format
- `csv` - CSV format

---

## Communication Endpoints

### Get Department Contact Info
```http
GET /communication/departments/:id/contact
Authorization: Bearer <token>
```

### Contact Department
```http
POST /communication/contact-department
Authorization: Bearer <student_token>
```

**Request Body:**
```json
{
  "departmentId": "dept-id",
  "subject": "Question about clearance",
  "message": "I have a question about...",
  "requestId": "optional-request-id"
}
```

### Get WhatsApp Link
```http
GET /communication/whatsapp-link/:departmentId?message=Hello
Authorization: Bearer <token>
```

### Get Message Templates
```http
GET /communication/templates
Authorization: Bearer <staff_token>
```

### Send Bulk Notification
```http
POST /communication/bulk-notify
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "recipients": "by_department",
  "recipientIds": ["id1", "id2"],
  "message": "Important announcement...",
  "subject": "Announcement",
  "channels": ["email", "sms"],
  "filters": {
    "department": "dept-id",
    "clearanceStatus": "pending"
  }
}
```

---

## User Profile Endpoints

### Get Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
```

### Change Password
```http
PUT /users/change-password
Authorization: Bearer <token>
```

### Get Notifications
```http
GET /users/notifications
Authorization: Bearer <token>
```

### Get Activity Log
```http
GET /users/activity?page=1&limit=20
Authorization: Bearer <token>
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "status": "fail",
  "statusCode": 400,
  "message": "Error message",
  "errorCode": "ERROR_CODE"
}
```

### Common Error Codes
| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `INVALID_CREDENTIALS` | Login credentials are incorrect |
| `UNAUTHORIZED` | Not authenticated |
| `FORBIDDEN` | Not authorized for this action |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ERROR` | Resource already exists |
| `ACCOUNT_LOCKED` | Account temporarily locked |
| `ACCOUNT_INACTIVE` | Account is deactivated |

---

## Rate Limiting

API requests are limited to:
- **100 requests per 15 minutes** per IP address

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Pagination

List endpoints support pagination with these query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 8
  }
}
```

---

## Filtering & Sorting

### Filtering
Use query parameters to filter results:
```
GET /admin/students?department=dept-id&batch=2020&clearanceStatus=pending
```

### Sorting
Sort using the `sort` parameter:
```
GET /admin/students?sort=-createdAt (descending)
GET /admin/students?sort=createdAt (ascending)
```

---

## WebSocket Events

Real-time updates are available via Socket.IO:

### Client Events (Send)
- `join` - Join user/department rooms
- `clearance-update` - Update clearance status

### Server Events (Receive)
- `clearance-status-changed` - Status update notification
- `new-clearance-request` - New request notification
- `new-comment` - New comment notification
- `certificate-issued` - Certificate issued notification
- `new-student-message` - Student message notification

### Connection Example
```javascript
const socket = io('ws://localhost:5000');

socket.emit('join', {
  userId: 'user-id',
  role: 'student',
  departmentId: 'dept-id'
});

socket.on('clearance-status-changed', (data) => {
  console.log('Status updated:', data);
});
```

---

## File Upload

### Upload Endpoint
```http
POST /upload/document
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - File to upload (max 5MB)
- `type` - Document type

**Supported Formats:**
- PDF (.pdf)
- Images (.jpg, .jpeg, .png)
- Documents (.doc, .docx)

---

*Last Updated: April 2024*