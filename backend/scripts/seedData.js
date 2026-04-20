/**
 * Seed Data Script
 * Populates the database with sample data for testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Student = require('../models/Student');
const Department = require('../models/Department');
const ClearanceRequest = require('../models/ClearanceRequest');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university_clearance');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Sample Departments
const departmentsData = [
  {
    name: 'Computer Science',
    code: 'CS',
    type: 'academic',
    description: 'Department of Computer Science',
    contactInfo: {
      email: 'cs@university.edu.pk',
      phone: '+92-51-1234567',
      whatsapp: '+92-300-1234567',
      extension: '101'
    },
    location: {
      building: 'Academic Block A',
      floor: '2nd Floor',
      roomNumber: 'A-201'
    },
    officeHours: {
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '10:00', close: '14:00', isOpen: false },
      sunday: { open: '10:00', close: '14:00', isOpen: false }
    },
    clearanceConfig: {
      isRequired: true,
      order: 1,
      canApproveIndependently: true,
      requiredDocuments: [
        { name: 'No Dues Certificate', description: 'From all faculty members', isMandatory: true },
        { name: 'Project Report', description: 'Final year project report', isMandatory: true }
      ],
      checklist: [
        { item: 'All courses completed', description: 'Check transcript', isMandatory: true },
        { item: 'No disciplinary issues', description: 'Check student record', isMandatory: true }
      ],
      instructions: 'Please submit all required documents to the CS department office.'
    }
  },
  {
    name: 'Software Engineering',
    code: 'SE',
    type: 'academic',
    description: 'Department of Software Engineering',
    contactInfo: {
      email: 'se@university.edu.pk',
      phone: '+92-51-1234568',
      whatsapp: '+92-300-1234568',
      extension: '102'
    },
    location: {
      building: 'Academic Block A',
      floor: '2nd Floor',
      roomNumber: 'A-202'
    },
    officeHours: {
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '10:00', close: '14:00', isOpen: false },
      sunday: { open: '10:00', close: '14:00', isOpen: false }
    },
    clearanceConfig: {
      isRequired: true,
      order: 2,
      canApproveIndependently: true,
      requiredDocuments: [
        { name: 'No Dues Certificate', description: 'From all faculty members', isMandatory: true },
        { name: 'Internship Report', description: 'Complete internship report', isMandatory: true }
      ],
      checklist: [
        { item: 'All courses completed', description: 'Check transcript', isMandatory: true },
        { item: 'Internship completed', description: 'Verify internship', isMandatory: true }
      ],
      instructions: 'Please submit all required documents to the SE department office.'
    }
  },
  {
    name: 'Finance Department',
    code: 'FIN',
    type: 'finance',
    description: 'Finance and Accounts Department',
    contactInfo: {
      email: 'finance@university.edu.pk',
      phone: '+92-51-1234569',
      whatsapp: '+92-300-1234569',
      extension: '201'
    },
    location: {
      building: 'Admin Block',
      floor: 'Ground Floor',
      roomNumber: 'G-101'
    },
    officeHours: {
      monday: { open: '09:00', close: '16:00', isOpen: true },
      tuesday: { open: '09:00', close: '16:00', isOpen: true },
      wednesday: { open: '09:00', close: '16:00', isOpen: true },
      thursday: { open: '09:00', close: '16:00', isOpen: true },
      friday: { open: '09:00', close: '16:00', isOpen: true },
      saturday: { open: '10:00', close: '14:00', isOpen: false },
      sunday: { open: '10:00', close: '14:00', isOpen: false }
    },
    clearanceConfig: {
      isRequired: true,
      order: 3,
      canApproveIndependently: true,
      requiredDocuments: [
        { name: 'Fee Challan', description: 'All paid fee challans', isMandatory: true },
        { name: 'Scholarship Letter', description: 'If applicable', isMandatory: false }
      ],
      checklist: [
        { item: 'All fees paid', description: 'Verify fee payment', isMandatory: true },
        { item: 'No outstanding dues', description: 'Check dues', isMandatory: true }
      ],
      instructions: 'Please clear all dues before applying for clearance.'
    }
  },
  {
    name: 'Library',
    code: 'LIB',
    type: 'library',
    description: 'University Library',
    contactInfo: {
      email: 'library@university.edu.pk',
      phone: '+92-51-1234570',
      whatsapp: '+92-300-1234570',
      extension: '301'
    },
    location: {
      building: 'Library Building',
      floor: 'All Floors',
      roomNumber: 'Main Desk'
    },
    officeHours: {
      monday: { open: '08:00', close: '20:00', isOpen: true },
      tuesday: { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday: { open: '08:00', close: '20:00', isOpen: true },
      friday: { open: '08:00', close: '20:00', isOpen: true },
      saturday: { open: '10:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: false }
    },
    clearanceConfig: {
      isRequired: true,
      order: 4,
      canApproveIndependently: true,
      requiredDocuments: [
        { name: 'Library Card', description: 'Return library card', isMandatory: true }
      ],
      checklist: [
        { item: 'All books returned', description: 'Check book records', isMandatory: true },
        { item: 'No library fines', description: 'Check fines', isMandatory: true }
      ],
      instructions: 'Please return all books and clear any fines before applying for clearance.'
    }
  },
  {
    name: 'Transport Office',
    code: 'TRN',
    type: 'transport',
    description: 'Transport Department',
    contactInfo: {
      email: 'transport@university.edu.pk',
      phone: '+92-51-1234571',
      whatsapp: '+92-300-1234571',
      extension: '401'
    },
    location: {
      building: 'Transport Office',
      floor: 'Ground Floor',
      roomNumber: 'T-101'
    },
    officeHours: {
      monday: { open: '08:00', close: '17:00', isOpen: true },
      tuesday: { open: '08:00', close: '17:00', isOpen: true },
      wednesday: { open: '08:00', close: '17:00', isOpen: true },
      thursday: { open: '08:00', close: '17:00', isOpen: true },
      friday: { open: '08:00', close: '17:00', isOpen: true },
      saturday: { open: '09:00', close: '14:00', isOpen: false },
      sunday: { open: '09:00', close: '14:00', isOpen: false }
    },
    clearanceConfig: {
      isRequired: false, // Optional for non-transport users
      order: 5,
      canApproveIndependently: true,
      requiredDocuments: [],
      checklist: [
        { item: 'Transport card returned', description: 'If applicable', isMandatory: false },
        { item: 'No transport dues', description: 'Check transport fees', isMandatory: false }
      ],
      instructions: 'Only required if you use university transport.'
    }
  },
  {
    name: 'Hostel Office',
    code: 'HST',
    type: 'hostel',
    description: 'Hostel Administration',
    contactInfo: {
      email: 'hostel@university.edu.pk',
      phone: '+92-51-1234572',
      whatsapp: '+92-300-1234572',
      extension: '501'
    },
    location: {
      building: 'Hostel Block',
      floor: 'Ground Floor',
      roomNumber: 'H-101'
    },
    officeHours: {
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '10:00', close: '14:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: true }
    },
    clearanceConfig: {
      isRequired: false, // Only for hostel residents
      order: 6,
      canApproveIndependently: true,
      requiredDocuments: [
        { name: 'Hostel Clearance Form', description: 'Signed by warden', isMandatory: true }
      ],
      checklist: [
        { item: 'Room vacated', description: 'Verify room checkout', isMandatory: true },
        { item: 'No hostel dues', description: 'Check hostel fees', isMandatory: true },
        { item: 'Items returned', description: 'All hostel items returned', isMandatory: true }
      ],
      instructions: 'Only required for hostel residents. Please clear your room and return all items.'
    }
  }
];

// Sample Admin User
const adminData = {
  firstName: 'System',
  lastName: 'Administrator',
  email: 'admin@university.edu.pk',
  password: 'Admin@123',
  role: 'admin',
  phone: '+92-300-0000000',
  isFirstLogin: true
};

// Sample Department Staff
const staffData = [
  {
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed.khan@university.edu.pk',
    password: 'Staff@123',
    role: 'hod',
    phone: '+92-300-1111111'
  },
  {
    firstName: 'Fatima',
    lastName: 'Ali',
    email: 'fatima.ali@university.edu.pk',
    password: 'Staff@123',
    role: 'finance_officer',
    phone: '+92-300-2222222'
  },
  {
    firstName: 'Muhammad',
    lastName: 'Hassan',
    email: 'muhammad.hassan@university.edu.pk',
    password: 'Staff@123',
    role: 'library_officer',
    phone: '+92-300-3333333'
  },
  {
    firstName: 'Ayesha',
    lastName: 'Raza',
    email: 'ayesha.raza@university.edu.pk',
    password: 'Staff@123',
    role: 'transport_officer',
    phone: '+92-300-4444444'
  }
];

// Sample Students
const studentsData = [
  {
    firstName: 'Ali',
    lastName: 'Ahmad',
    registrationNumber: 'FA20-BCS-001',
    email: 'ali.ahmad@student.university.edu.pk',
    universityEmail: 'fa20-bcs-001@student.university.edu.pk',
    password: 'FA20-BCS-001',
    phone: '+92-300-5555551',
    program: 'BS',
    discipline: 'Computer Science',
    batch: '2020',
    semester: 8,
    cgpa: 3.5,
    isFirstLogin: true
  },
  {
    firstName: 'Sara',
    lastName: 'Khalid',
    registrationNumber: 'FA20-BCS-002',
    email: 'sara.khalid@student.university.edu.pk',
    universityEmail: 'fa20-bcs-002@student.university.edu.pk',
    password: 'FA20-BCS-002',
    phone: '+92-300-5555552',
    program: 'BS',
    discipline: 'Computer Science',
    batch: '2020',
    semester: 8,
    cgpa: 3.8,
    isFirstLogin: true
  },
  {
    firstName: 'Usman',
    lastName: 'Farooq',
    registrationNumber: 'FA20-BSE-001',
    email: 'usman.farooq@student.university.edu.pk',
    universityEmail: 'fa20-bse-001@student.university.edu.pk',
    password: 'FA20-BSE-001',
    phone: '+92-300-5555553',
    program: 'BS',
    discipline: 'Software Engineering',
    batch: '2020',
    semester: 8,
    cgpa: 3.2,
    isFirstLogin: true
  },
  {
    firstName: 'Hira',
    lastName: 'Mahmood',
    registrationNumber: 'FA21-BCS-015',
    email: 'hira.mahmood@student.university.edu.pk',
    universityEmail: 'fa21-bcs-015@student.university.edu.pk',
    password: 'FA21-BCS-015',
    phone: '+92-300-5555554',
    program: 'BS',
    discipline: 'Computer Science',
    batch: '2021',
    semester: 6,
    cgpa: 3.6,
    isFirstLogin: true
  },
  {
    firstName: 'Bilal',
    lastName: 'Aslam',
    registrationNumber: 'SP19-BCS-010',
    email: 'bilal.aslam@student.university.edu.pk',
    universityEmail: 'sp19-bcs-010@student.university.edu.pk',
    password: 'SP19-BCS-010',
    phone: '+92-300-5555555',
    program: 'BS',
    discipline: 'Computer Science',
    batch: '2019',
    semester: 8,
    cgpa: 2.9,
    isFirstLogin: true
  }
];

// Seed function
const seedData = async () => {
  try {
    console.log('Starting database seeding...\n');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Department.deleteMany({}),
      ClearanceRequest.deleteMany({})
    ]);
    console.log('Existing data cleared.\n');
    
    // Create Departments
    console.log('Creating departments...');
    const departments = await Department.insertMany(departmentsData);
    console.log(`Created ${departments.length} departments.`);
    
    // Map department codes to IDs
    const deptMap = {};
    departments.forEach(dept => {
      deptMap[dept.code] = dept._id;
    });
    
    // Create Admin
    console.log('\nCreating admin user...');
    const admin = await User.create(adminData);
    console.log(`Admin created: ${admin.email}`);
    
    // Create Staff with department assignments
    console.log('\nCreating staff users...');
    staffData[0].department = deptMap['CS']; // HOD for CS
    staffData[1].department = deptMap['FIN']; // Finance officer
    staffData[2].department = deptMap['LIB']; // Library officer
    staffData[3].department = deptMap['TRN']; // Transport officer
    
    const staff = await User.insertMany(staffData);
    console.log(`Created ${staff.length} staff users.`);
    
    // Update department heads
    await Department.findByIdAndUpdate(deptMap['CS'], { head: staff[0]._id });
    
    // Create Students
    console.log('\nCreating students...');
    studentsData[0].department = deptMap['CS'];
    studentsData[1].department = deptMap['CS'];
    studentsData[2].department = deptMap['SE'];
    studentsData[3].department = deptMap['CS'];
    studentsData[4].department = deptMap['CS'];
    
    const students = await Student.insertMany(studentsData);
    console.log(`Created ${students.length} students.`);
    
    // Create Sample Clearance Requests
    console.log('\nCreating sample clearance requests...');
    const clearanceRequests = [];
    
    // Create a cleared request for first student
    const clearedRequest = new ClearanceRequest({
      student: students[0]._id,
      requestType: 'graduation',
      status: 'cleared',
      progress: {
        totalDepartments: 6,
        clearedDepartments: 6,
        pendingDepartments: 0,
        rejectedDepartments: 0,
        percentage: 100
      },
      departmentStatuses: departments.map((dept, index) => ({
        department: dept._id,
        status: 'cleared',
        clearedBy: staff[index % staff.length]._id,
        clearedAt: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000)
      })),
      timeline: [
        {
          action: 'created',
          performedBy: students[0]._id,
          performedByModel: 'Student',
          description: 'Clearance request created',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          action: 'submitted',
          performedBy: students[0]._id,
          performedByModel: 'Student',
          description: 'Clearance request submitted',
          timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
        },
        {
          action: 'completed',
          performedBy: admin._id,
          performedByModel: 'User',
          description: 'All departments cleared',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ],
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      certificate: {
        issued: true,
        issuedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        issuedBy: admin._id,
        certificateNumber: 'CERT-2024-001'
      }
    });
    
    clearanceRequests.push(clearedRequest);
    
    // Create an in-progress request for second student
    const inProgressRequest = new ClearanceRequest({
      student: students[1]._id,
      requestType: 'graduation',
      status: 'in_progress',
      progress: {
        totalDepartments: 6,
        clearedDepartments: 3,
        pendingDepartments: 3,
        rejectedDepartments: 0,
        percentage: 50
      },
      departmentStatuses: departments.map((dept, index) => ({
        department: dept._id,
        status: index < 3 ? 'cleared' : 'pending',
        ...(index < 3 && {
          clearedBy: staff[index % staff.length]._id,
          clearedAt: new Date(Date.now() - (3 - index) * 24 * 60 * 60 * 1000)
        })
      })),
      timeline: [
        {
          action: 'created',
          performedBy: students[1]._id,
          performedByModel: 'Student',
          description: 'Clearance request created',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          action: 'submitted',
          performedBy: students[1]._id,
          performedByModel: 'Student',
          description: 'Clearance request submitted',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        }
      ]
    });
    
    clearanceRequests.push(inProgressRequest);
    
    // Create a rejected request for fifth student
    const rejectedRequest = new ClearanceRequest({
      student: students[4]._id,
      requestType: 'graduation',
      status: 'rejected',
      progress: {
        totalDepartments: 6,
        clearedDepartments: 2,
        pendingDepartments: 3,
        rejectedDepartments: 1,
        percentage: 33
      },
      departmentStatuses: departments.map((dept, index) => ({
        department: dept._id,
        status: index === 2 ? 'rejected' : (index < 2 ? 'cleared' : 'pending'),
        ...(index === 2 && {
          remarks: 'Outstanding dues of Rs. 25,000',
          reviewedBy: staff[1]._id,
          reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }),
        ...(index < 2 && {
          clearedBy: staff[index % staff.length]._id,
          clearedAt: new Date(Date.now() - (5 - index) * 24 * 60 * 60 * 1000)
        })
      })),
      timeline: [
        {
          action: 'created',
          performedBy: students[4]._id,
          performedByModel: 'Student',
          description: 'Clearance request created',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          action: 'submitted',
          performedBy: students[4]._id,
          performedByModel: 'Student',
          description: 'Clearance request submitted',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        },
        {
          action: 'department_rejected',
          department: departments[2]._id,
          performedBy: staff[1]._id,
          performedByModel: 'User',
          description: 'Finance department rejected: Outstanding dues of Rs. 25,000',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ]
    });
    
    clearanceRequests.push(rejectedRequest);
    
    await ClearanceRequest.insertMany(clearanceRequests);
    console.log(`Created ${clearanceRequests.length} clearance requests.`);
    
    // Update student clearance statuses
    await Student.findByIdAndUpdate(students[0]._id, { clearanceStatus: 'cleared' });
    await Student.findByIdAndUpdate(students[1]._id, { clearanceStatus: 'in_progress' });
    await Student.findByIdAndUpdate(students[4]._id, { clearanceStatus: 'rejected' });
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n--- Login Credentials ---');
    console.log('Admin: admin@university.edu.pk / Admin@123');
    console.log('Staff: ahmed.khan@university.edu.pk / Staff@123');
    console.log('Student: FA20-BCS-001 / FA20-BCS-001');
    console.log('-------------------------\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
connectDB().then(() => {
  seedData();
});