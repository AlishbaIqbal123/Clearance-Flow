/**
 * Student Model
 * Handles student information and clearance status
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  // Academic Information
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  
  rollNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  fatherName: {
    type: String,
    trim: true,
    maxlength: [100, 'Father name cannot exceed 100 characters']
  },
  
  cnic: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined values
    match: [/^\d{5}-\d{7}-\d$/, 'Please enter a valid CNIC (XXXXX-XXXXXXX-X)']
  },
  
  dateOfBirth: {
    type: Date
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  
  // University-assigned email (for login)
  universityEmail: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  
  // Address
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: { type: String, default: 'Pakistan' }
  },
  
  // Academic Details
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  
  program: {
    type: String,
    required: [true, 'Program is required'],
    enum: ['BS', 'MS', 'PhD', 'Diploma', 'Certificate']
  },
  
  discipline: {
    type: String,
    required: [true, 'Discipline/major is required'],
    trim: true
  },
  
  semester: {
    type: Number,
    min: 1,
    max: 12
  },
  
  batch: {
    type: String,
    required: [true, 'Batch year is required'],
    match: [/^\d{4}$/, 'Batch must be a valid year (YYYY)']
  },
  
  section: {
    type: String,
    uppercase: true,
    trim: true
  },
  
  cgpa: {
    type: Number,
    min: 0,
    max: 4.0
  },
  
  // Enrollment Status
  enrollmentStatus: {
    type: String,
    enum: ['active', 'graduated', 'suspended', 'withdrawn', 'expelled'],
    default: 'active'
  },
  
  // Clearance Information
  clearanceStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'pending', 'cleared', 'rejected'],
    default: 'not_started'
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  
  passwordResetToken: {
    type: String,
    select: false
  },
  
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Profile
  avatar: {
    type: String,
    default: null
  },
  
  // Documents
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Last Login
  lastLogin: {
    type: Date
  },
  
  // Login Attempts (for security)
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  
  // Hostel Information (if applicable)
  hostelInfo: {
    isHostelResident: { type: Boolean, default: false },
    hostelName: String,
    roomNumber: String,
    checkoutDate: Date
  },
  
  // Transport Information (if applicable)
  transportInfo: {
    usesTransport: { type: Boolean, default: false },
    route: String,
    stop: String
  },
  
  // Library Information
  libraryInfo: {
    booksIssued: [{ type: String }],
    fines: { type: Number, default: 0 },
    overdueBooks: { type: Number, default: 0 }
  },
  
  // Finance Information
  financeInfo: {
    totalDues: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    scholarships: [{
      name: String,
      amount: Number,
      semester: String
    }]
  },
  
  // Clearance Request History
  clearanceHistory: [{
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClearanceRequest'
    },
    requestedAt: Date,
    completedAt: Date,
    status: String
  }],
  
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
studentSchema.index({ registrationNumber: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ universityEmail: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ clearanceStatus: 1 });
studentSchema.index({ enrollmentStatus: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ 'financeInfo.pendingAmount': 1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
studentSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to compare password
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
studentSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Static method to find student by credentials
studentSchema.statics.findByCredentials = async function(registrationNumber, password) {
  const student = await this.findOne({ 
    registrationNumber: registrationNumber.toUpperCase(),
    isActive: true 
  }).select('+password');
  
  if (!student) {
    throw new Error('Invalid registration number or password');
  }
  
  if (student.isLocked) {
    throw new Error('Account is temporarily locked. Please try again later.');
  }
  
  const isMatch = await student.comparePassword(password);
  
  if (!isMatch) {
    await student.incrementLoginAttempts();
    throw new Error('Invalid registration number or password');
  }
  
  if (student.loginAttempts > 0) {
    await student.updateOne({
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 }
    });
  }
  
  return student;
};

// Static method to search students
studentSchema.statics.search = async function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { registrationNumber: searchRegex },
      { email: searchRegex },
      { cnic: searchRegex }
    ],
    isActive: true
  }).populate('department', 'name code');
};

// Static method to get students by department
studentSchema.statics.getByDepartment = async function(departmentId, options = {}) {
  const { status, batch, limit = 50, skip = 0 } = options;
  
  const query = { department: departmentId, isActive: true };
  if (status) query.clearanceStatus = status;
  if (batch) query.batch = batch;
  
  return this.find(query)
    .select('-password')
    .populate('department', 'name code')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get clearance statistics
studentSchema.statics.getClearanceStats = async function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$clearanceStatus',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Student', studentSchema);