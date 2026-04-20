/**
 * ClearanceRequest Model
 * Handles student clearance requests and their lifecycle
 */

const mongoose = require('mongoose');

const clearanceRequestSchema = new mongoose.Schema({
  // Request Information
  requestId: {
    type: String,
    unique: true,
    index: true
  },
  
  // Student Information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  
  // Request Type
  requestType: {
    type: String,
    enum: ['graduation', 'withdrawal', 'transfer', 'semester_end', 'custom'],
    default: 'graduation'
  },
  
  // Request Reason (for custom requests)
  reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  
  // Overall Status
  status: {
    type: String,
    enum: [
      'draft',           // Student is filling out
      'submitted',       // Submitted but not yet processing
      'in_progress',     // Being processed by departments
      'pending',         // Waiting for student action
      'partially_cleared', // Some departments cleared
      'cleared',         // All departments cleared
      'rejected',        // Rejected by at least one department
      'cancelled'        // Cancelled by student
    ],
    default: 'draft'
  },
  
  // Department-wise Clearance Status
  departmentStatuses: [{
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'cleared', 'rejected', 'on_hold'],
      default: 'pending'
    },
    remarks: {
      type: String,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters']
    },
    clearedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    clearedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    dueAmount: {
      type: Number,
      default: 0
    },
    documentsRequired: [{
      name: String,
      submitted: { type: Boolean, default: false },
      url: String
    }],
    checklistItems: [{
      item: String,
      completed: { type: Boolean, default: false },
      completedAt: Date
    }]
  }],
  
  // Progress Tracking
  progress: {
    totalDepartments: { type: Number, default: 0 },
    clearedDepartments: { type: Number, default: 0 },
    pendingDepartments: { type: Number, default: 0 },
    rejectedDepartments: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },
  
  // Timeline
  timeline: [{
    action: {
      type: String,
      enum: [
        'created',
        'submitted',
        'department_assigned',
        'department_reviewed',
        'department_cleared',
        'department_rejected',
        'student_notified',
        'documents_requested',
        'documents_submitted',
        'completed',
        'cancelled'
      ]
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'timeline.performedByModel'
    },
    performedByModel: {
      type: String,
      enum: ['User', 'Student']
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Documents Submitted by Student
  submittedDocuments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Comments/Messages
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'comments.authorModel'
    },
    authorModel: {
      type: String,
      enum: ['User', 'Student']
    },
    authorName: String,
    message: {
      type: String,
      required: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    isInternal: {
      type: Boolean,
      default: false // If true, student can't see this
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notifications Sent
  notificationsSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'whatsapp']
    },
    recipient: String,
    subject: String,
    content: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    }
  }],
  
  // Final Clearance Certificate
  certificate: {
    issued: { type: Boolean, default: false },
    issuedAt: Date,
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    certificateNumber: String,
    pdfUrl: String
  },
  
  // Expected Completion Date
  expectedCompletionDate: Date,
  
  // Actual Completion Date
  completedAt: Date,
  
  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'updatedByModel'
  },
  
  updatedByModel: {
    type: String,
    enum: ['User', 'Student']
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
clearanceRequestSchema.index({ requestId: 1 });
clearanceRequestSchema.index({ student: 1 });
clearanceRequestSchema.index({ status: 1 });
clearanceRequestSchema.index({ createdAt: -1 });
clearanceRequestSchema.index({ 'departmentStatuses.department': 1 });
clearanceRequestSchema.index({ 'departmentStatuses.status': 1 });

// Compound indexes for common queries
clearanceRequestSchema.index({ student: 1, status: 1 });
clearanceRequestSchema.index({ 'departmentStatuses.department': 1, 'departmentStatuses.status': 1 });

// Pre-save middleware to generate request ID
clearanceRequestSchema.pre('save', async function(next) {
  if (!this.requestId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.requestId = `CLR-${timestamp}-${random}`;
  }
  
  // Update progress
  if (this.departmentStatuses && this.departmentStatuses.length > 0) {
    const total = this.departmentStatuses.length;
    const cleared = this.departmentStatuses.filter(ds => ds.status === 'cleared').length;
    const pending = this.departmentStatuses.filter(ds => ds.status === 'pending').length;
    const rejected = this.departmentStatuses.filter(ds => ds.status === 'rejected').length;
    
    this.progress = {
      totalDepartments: total,
      clearedDepartments: cleared,
      pendingDepartments: pending,
      rejectedDepartments: rejected,
      percentage: Math.round((cleared / total) * 100)
    };
    
    // Update overall status based on department statuses
    if (rejected > 0) {
      this.status = 'rejected';
    } else if (cleared === total) {
      this.status = 'cleared';
      if (!this.completedAt) {
        this.completedAt = new Date();
      }
    } else if (cleared > 0 && cleared < total) {
      this.status = 'partially_cleared';
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

// Virtual for isComplete
clearanceRequestSchema.virtual('isComplete').get(function() {
  return this.status === 'cleared' || this.status === 'rejected';
});

// Virtual for days since submission
clearanceRequestSchema.virtual('daysSinceSubmission').get(function() {
  if (!this.timeline || this.timeline.length === 0) return 0;
  
  const submissionEvent = this.timeline.find(t => t.action === 'submitted');
  if (!submissionEvent) return 0;
  
  const diff = Date.now() - submissionEvent.timestamp.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Instance method to submit request
clearanceRequestSchema.methods.submit = async function() {
  if (this.status !== 'draft') {
    throw new Error('Only draft requests can be submitted');
  }
  
  this.status = 'submitted';
  this.timeline.push({
    action: 'submitted',
    performedBy: this.student,
    performedByModel: 'Student',
    description: 'Clearance request submitted by student'
  });
  
  // Initialize department statuses
  const Department = mongoose.model('Department');
  const departments = await Department.getClearanceDepartments();
  
  this.departmentStatuses = departments.map(dept => ({
    department: dept._id,
    status: 'pending',
    documentsRequired: dept.clearanceConfig?.requiredDocuments?.map(doc => ({
      name: doc.name,
      submitted: false
    })) || [],
    checklistItems: dept.clearanceConfig?.checklist?.map(item => ({
      item: item.item,
      completed: false
    })) || []
  }));
  
  await this.save();
  return this;
};

// Instance method to update department status
clearanceRequestSchema.methods.updateDepartmentStatus = async function(
  departmentId, 
  status, 
  options = {}
) {
  const { remarks, clearedBy, dueAmount } = options;
  
  const deptStatus = this.departmentStatuses.find(
    ds => ds.department.toString() === departmentId.toString()
  );
  
  if (!deptStatus) {
    throw new Error('Department not found in this clearance request');
  }
  
  deptStatus.status = status;
  
  if (remarks) deptStatus.remarks = remarks;
  if (dueAmount !== undefined) deptStatus.dueAmount = dueAmount;
  
  if (status === 'cleared') {
    deptStatus.clearedBy = clearedBy;
    deptStatus.clearedAt = new Date();
    
    this.timeline.push({
      action: 'department_cleared',
      department: departmentId,
      performedBy: clearedBy,
      performedByModel: 'User',
      description: `Department cleared the request`
    });
  } else if (status === 'rejected') {
    deptStatus.reviewedBy = clearedBy;
    deptStatus.reviewedAt = new Date();
    
    this.timeline.push({
      action: 'department_rejected',
      department: departmentId,
      performedBy: clearedBy,
      performedByModel: 'User',
      description: `Department rejected the request: ${remarks || 'No reason provided'}`
    });
  } else if (status === 'in_review') {
    deptStatus.reviewedBy = clearedBy;
    deptStatus.reviewedAt = new Date();
    
    this.timeline.push({
      action: 'department_reviewed',
      department: departmentId,
      performedBy: clearedBy,
      performedByModel: 'User',
      description: 'Department started reviewing the request'
    });
  }
  
  await this.save();
  return this;
};

// Instance method to add comment
clearanceRequestSchema.methods.addComment = async function(commentData) {
  this.comments.push(commentData);
  await this.save();
  return this;
};

// Instance method to cancel request
clearanceRequestSchema.methods.cancel = async function(reason, cancelledBy) {
  if (this.isComplete) {
    throw new Error('Cannot cancel a completed request');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  
  this.timeline.push({
    action: 'cancelled',
    performedBy: cancelledBy,
    performedByModel: 'Student',
    description: `Request cancelled: ${reason}`
  });
  
  await this.save();
  return this;
};

// Instance method to issue certificate
clearanceRequestSchema.methods.issueCertificate = async function(issuedBy) {
  if (this.status !== 'cleared') {
    throw new Error('Can only issue certificate for cleared requests');
  }
  
  const timestamp = Date.now().toString(36).toUpperCase();
  this.certificate = {
    issued: true,
    issuedAt: new Date(),
    issuedBy: issuedBy,
    certificateNumber: `CERT-${this.requestId}-${timestamp}`
  };
  
  this.timeline.push({
    action: 'completed',
    performedBy: issuedBy,
    performedByModel: 'User',
    description: 'Clearance certificate issued'
  });
  
  await this.save();
  return this;
};

// Static method to get requests by student
clearanceRequestSchema.statics.getByStudent = async function(studentId, options = {}) {
  const { status, limit = 10, skip = 0 } = options;
  
  const query = { student: studentId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('student', 'firstName lastName registrationNumber email')
    .populate('departmentStatuses.department', 'name code type contactInfo')
    .populate('departmentStatuses.clearedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get requests by department
clearanceRequestSchema.statics.getByDepartment = async function(departmentId, options = {}) {
  const { status, limit = 50, skip = 0 } = options;
  
  const query = { 'departmentStatuses.department': departmentId };
  if (status) {
    query['departmentStatuses.status'] = status;
  }
  
  return this.find(query)
    .populate('student', 'firstName lastName registrationNumber email phone department')
    .populate('student.department', 'name code')
    .populate('departmentStatuses.department', 'name code')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get pending requests for department
clearanceRequestSchema.statics.getPendingForDepartment = async function(departmentId) {
  return this.find({
    'departmentStatuses.department': departmentId,
    'departmentStatuses.status': { $in: ['pending', 'in_review'] },
    status: { $nin: ['cancelled', 'cleared', 'rejected'] }
  })
    .populate('student', 'firstName lastName registrationNumber email phone')
    .sort({ createdAt: 1 });
};

// Static method to get statistics
clearanceRequestSchema.statics.getStatistics = async function(filters = {}) {
  const matchStage = {};
  
  if (filters.startDate || filters.endDate) {
    matchStage.createdAt = {};
    if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
  }
  
  if (filters.department) {
    matchStage['departmentStatuses.department'] = mongoose.Types.ObjectId(filters.department);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProcessingTime: {
          $avg: {
            $cond: [
              { $ne: ['$completedAt', null] },
              { $subtract: ['$completedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('ClearanceRequest', clearanceRequestSchema);