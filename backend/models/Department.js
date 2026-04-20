/**
 * Department Model
 * Handles university departments and their clearance configurations
 */

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Department code cannot exceed 10 characters']
  },
  
  // Department Type
  type: {
    type: String,
    required: [true, 'Department type is required'],
    enum: [
      'academic',      // CS, SE, EE, etc.
      'administrative', // Registrar, Admin
      'finance',       // Finance/Accounts
      'library',       // Library
      'transport',     // Transport
      'hostel',        // Hostel/Accommodation
      'sports',        // Sports
      'medical',       // Medical Center
      'security',      // Security
      'custom'         // Any other department
    ],
    default: 'academic'
  },
  
  // Description
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Contact Information
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    whatsapp: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid WhatsApp number']
    },
    extension: {
      type: String,
      trim: true
    }
  },
  
  // Location
  location: {
    building: String,
    floor: String,
    roomNumber: String,
    address: String
  },
  
  // Office Hours
  officeHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  
  // Clearance Configuration
  clearanceConfig: {
    // Is this department required for clearance?
    isRequired: {
      type: Boolean,
      default: true
    },
    
    // Order in clearance process (for sequential processing)
    order: {
      type: Number,
      default: 0
    },
    
    // Can approve/reject independently or needs other departments?
    canApproveIndependently: {
      type: Boolean,
      default: true
    },
    
    // Required documents for clearance
    requiredDocuments: [{
      name: String,
      description: String,
      isMandatory: { type: Boolean, default: true }
    }],
    
    // Checklist items for clearance
    checklist: [{
      item: String,
      description: String,
      isMandatory: { type: Boolean, default: true }
    }],
    
    // Auto-clearance rules (if applicable)
    autoClearanceRules: {
      enabled: { type: Boolean, default: false },
      conditions: [{
        field: String,
        operator: { type: String, enum: ['eq', 'ne', 'gt', 'lt', 'gte', 'lte'] },
        value: mongoose.Schema.Types.Mixed
      }]
    },
    
    // Clearance instructions for students
    instructions: {
      type: String,
      maxlength: [2000, 'Instructions cannot exceed 2000 characters']
    }
  },
  
  // Department Head (HOD)
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Staff Members
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Statistics (updated periodically)
  stats: {
    totalClearanceRequests: { type: Number, default: 0 },
    pendingRequests: { type: Number, default: 0 },
    clearedRequests: { type: Number, default: 0 },
    rejectedRequests: { type: Number, default: 0 },
    averageProcessingTime: { type: Number, default: 0 } // in hours
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
departmentSchema.index({ code: 1 });
departmentSchema.index({ type: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ 'clearanceConfig.order': 1 });

// Virtual for full contact info
departmentSchema.virtual('fullContact').get(function() {
  return {
    email: this.contactInfo?.email,
    phone: this.contactInfo?.phone,
    whatsapp: this.contactInfo?.whatsapp,
    extension: this.contactInfo?.extension
  };
});

// Virtual for WhatsApp link
departmentSchema.virtual('whatsappLink').get(function() {
  if (this.contactInfo?.whatsapp) {
    const cleanNumber = this.contactInfo.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  }
  return null;
});

// Pre-save middleware
departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get departments by type
departmentSchema.statics.getByType = async function(type) {
  return this.find({ type, isActive: true })
    .populate('head', 'firstName lastName email')
    .populate('staff', 'firstName lastName email role')
    .sort({ 'clearanceConfig.order': 1 });
};

// Static method to get all active departments for clearance
departmentSchema.statics.getClearanceDepartments = async function() {
  return this.find({ 
    isActive: true,
    'clearanceConfig.isRequired': true 
  })
    .select('-staff')
    .populate('head', 'firstName lastName email phone')
    .sort({ 'clearanceConfig.order': 1 });
};

// Static method to get department with staff
departmentSchema.statics.getWithStaff = async function(departmentId) {
  return this.findById(departmentId)
    .populate('head', 'firstName lastName email phone')
    .populate('staff', 'firstName lastName email phone role');
};

// Instance method to update stats
departmentSchema.methods.updateStats = async function() {
  const ClearanceStatus = mongoose.model('ClearanceStatus');
  
  const stats = await ClearanceStatus.aggregate([
    { $match: { department: this._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const statMap = stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});
  
  this.stats = {
    totalClearanceRequests: statMap.total || 0,
    pendingRequests: statMap.pending || 0,
    clearedRequests: statMap.cleared || 0,
    rejectedRequests: statMap.rejected || 0
  };
  
  await this.save();
};

module.exports = mongoose.model('Department', departmentSchema);