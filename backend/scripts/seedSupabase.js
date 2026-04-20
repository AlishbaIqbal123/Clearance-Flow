/**
 * Seed data for Supabase
 * Populates departments, staff profiles, and student profiles
 */
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function seed() {
  console.log('=========================================');
  console.log('🚀 Starting Supabase Database Seeding');
  console.log('=========================================');

  try {
    // 1. Seed Departments
    console.log('\n--- Seeding Departments ---');
    const departments = [
      { name: 'Computer Science', code: 'CS', type: 'academic', is_active: true },
      { name: 'Software Engineering', code: 'SE', type: 'academic', is_active: true },
      { name: 'Finance Office', code: 'FIN', type: 'finance', is_active: true },
      { name: 'Library', code: 'LIB', type: 'library', is_active: true },
      { name: 'Transport Office', code: 'TRN', type: 'transport', is_active: true }
    ];

    const { data: insertedDepts, error: deptError } = await supabase
      .from('departments')
      .upsert(departments, { onConflict: 'code' })
      .select();

    if (deptError) throw deptError;
    console.log(`✅ ${insertedDepts.length} Departments seeded/updated.`);

    const deptMap = {};
    insertedDepts.forEach(d => deptMap[d.code] = d.id);

    // 2. Seed Admin & Staff Profiles
    console.log('\n--- Seeding Staff Profiles ---');
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const staffPassword = await bcrypt.hash('Staff@123', 12);

    const profiles = [
      {
        phone: '+923001234567',
        first_name: 'System',
        last_name: 'Administrator',
        email: 'admin@university.edu.pk',
        password: adminPassword,
        role: 'admin',
        is_first_login: false,
        is_active: true
      },
      {
        phone: '+923001234567',
        first_name: 'Dr. Ahmed',
        last_name: 'Khan',
        email: 'hod.cs@university.edu.pk',
        password: staffPassword,
        role: 'hod',
        department_id: deptMap['CS'],
        is_first_login: false,
        is_active: true
      },
      {
        phone: '+923001234567',
        first_name: 'Sarah',
        last_name: 'Ahmed',
        email: 'finance.officer@university.edu.pk',
        password: staffPassword,
        role: 'finance_officer',
        department_id: deptMap['FIN'],
        is_first_login: false,
        is_active: true
      },
      {
        phone: '+923001234567',
        first_name: 'Muhammad',
        last_name: 'Ali',
        email: 'library.officer@university.edu.pk',
        password: staffPassword,
        role: 'library_officer',
        department_id: deptMap['LIB'],
        is_first_login: false,
        is_active: true
      }
    ];

    const { data: insertedProfiles, error: profileError } = await supabase
      .from('profiles')
      .upsert(profiles, { onConflict: 'email' })
      .select();

    if (profileError) throw profileError;
    console.log(`✅ ${insertedProfiles.length} Staff profiles seeded/updated.`);

    // 3. Seed Student Profiles
    console.log('\n--- Seeding Student Profiles ---');
    const students = [
      {
        phone: '+923001234567',
        first_name: 'Ali',
        last_name: 'Ahmad',
        registration_number: 'FA20-BCS-001',
        email: 'ali.ahmad@student.university.edu.pk',
        password: await bcrypt.hash('FA20-BCS-001', 12),
        department_id: deptMap['CS'],
        program: 'BS',
        discipline: 'Computer Science',
        batch: '2020',
        cgpa: 3.5,
        is_first_login: true,
        is_active: true,
        clearance_status: 'not_started'
      },
      {
        phone: '+923001234567',
        first_name: 'Sara',
        last_name: 'Khalid',
        registration_number: 'FA20-BCS-002',
        email: 'sara.khalid@student.university.edu.pk',
        password: await bcrypt.hash('FA20-BCS-002', 12),
        department_id: deptMap['CS'],
        program: 'BS',
        discipline: 'Computer Science',
        batch: '2020',
        cgpa: 3.8,
        is_first_login: true,
        is_active: true,
        clearance_status: 'not_started'
      },
      {
        phone: '+923001234567',
        first_name: 'Usman',
        last_name: 'Farooq',
        registration_number: 'FA20-BSE-001',
        email: 'usman.farooq@student.university.edu.pk',
        password: await bcrypt.hash('FA20-BSE-001', 12),
        department_id: deptMap['SE'],
        program: 'BS',
        discipline: 'Software Engineering',
        batch: '2020',
        cgpa: 3.2,
        is_first_login: true,
        is_active: true,
        clearance_status: 'not_started'
      },
      {
        phone: '+923001234567',
        first_name: 'Hira',
        last_name: 'Mahmood',
        registration_number: 'FA21-BCS-015',
        email: 'hira.mahmood@student.university.edu.pk',
        password: await bcrypt.hash('FA21-BCS-015', 12),
        department_id: deptMap['CS'],
        program: 'BS',
        discipline: 'Computer Science',
        batch: '2021',
        cgpa: 3.6,
        is_first_login: true,
        is_active: true,
        clearance_status: 'not_started'
      },
      {
        phone: '+923001234567',
        first_name: 'Bilal',
        last_name: 'Aslam',
        registration_number: 'SP19-BCS-010',
        email: 'bilal.aslam@student.university.edu.pk',
        password: await bcrypt.hash('SP19-BCS-010', 12),
        department_id: deptMap['CS'],
        program: 'BS',
        discipline: 'Computer Science',
        batch: '2019',
        cgpa: 2.9,
        is_first_login: true,
        is_active: true,
        clearance_status: 'not_started'
      }
    ];

    const { data: insertedStudents, error: studentError } = await supabase
      .from('student_profiles')
      .upsert(students, { onConflict: 'registration_number' })
      .select();

    if (studentError) throw studentError;
    console.log(`✅ ${insertedStudents.length} Student profiles seeded/updated.`);

    console.log('\n--- Seeding Summary ---');
    console.log('Admin: admin@university.edu.pk / Admin@123');
    console.log('HOD (CS): hod.cs@university.edu.pk / Staff@123');
    console.log('Student: FA20-BCS-001 / FA20-BCS-001');
    console.log('\n✅ Database seeding completed successfully!');

  } catch (error) {
    console.error('\n❌ Seeding failed:');
    console.error(error.message || error);
  } finally {
    process.exit();
  }
}

seed();
