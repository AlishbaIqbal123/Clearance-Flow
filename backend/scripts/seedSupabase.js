/**
 * Seed data for Supabase
 * Populates departments, staff profiles, and student profiles
 * Uses fixed UUIDs for core departments to ensure consistency
 */
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const DEPT_IDS = {
  CS: '9b2c930c-5204-4921-bf6d-d9bc1355a560',
  SE: '8c1b820b-4103-3810-ae5c-c8ab0244a450',
  FIN: '7b0a710a-3092-2709-9d4b-b79a91339340',
  LIB: '6a9f609f-2081-1608-8c3a-a68f80228230',
  TRN: '5e8e508e-1070-0507-7b29-957e70117120'
};

const USER_IDS = {
  ADMIN: 'a1b2c3d4-e5f6-4a5b-bc6d-e7f8a9b0c1d2',
  HOD_CS: 'b2c3d4e5-f6a7-5b6c-cd7e-f8a9b0c1d2e3',
  FINANCE: 'c3d4e5f6-a7b8-6c7d-de8f-a9b0c1d2e3f4',
  LIBRARY: 'd4e5f6a7-b8c9-7d8e-ef9a-b0c1d2e3f4a5'
};

async function seed() {
  console.log('=========================================');
  console.log('🚀 Starting Stable Supabase Seeding');
  console.log('=========================================');

  try {
    // 1. Seed Departments
    console.log('\n--- Seeding Departments ---');
    const departments = [
      { id: DEPT_IDS.CS, name: 'Computer Science', code: 'CS', type: 'academic', is_active: true, clearance_config: { isRequired: true, order: 1 } },
      { id: DEPT_IDS.SE, name: 'Software Engineering', code: 'SE', type: 'academic', is_active: true, clearance_config: { isRequired: true, order: 2 } },
      { id: DEPT_IDS.FIN, name: 'Finance Office', code: 'FIN', type: 'finance', is_active: true, clearance_config: { isRequired: true, order: 3 } },
      { id: DEPT_IDS.LIB, name: 'Library', code: 'LIB', type: 'library', is_active: true, clearance_config: { isRequired: true, order: 4 } },
      { id: DEPT_IDS.TRN, name: 'Transport Office', code: 'TRN', type: 'transport', is_active: true, clearance_config: { isRequired: true, order: 5 } }
    ];

    const { error: deptError } = await supabase
      .from('departments')
      .upsert(departments, { onConflict: 'id' });

    if (deptError) throw deptError;
    console.log(`✅ ${departments.length} Departments seeded with fixed IDs.`);

    // 2. Seed Admin & Staff Profiles
    console.log('\n--- Seeding Staff Profiles ---');
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const staffPassword = await bcrypt.hash('Staff@123', 12);

    const profiles = [
      {
        id: USER_IDS.ADMIN,
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
        id: USER_IDS.HOD_CS,
        phone: '+923001234567',
        first_name: 'Dr. Ahmed',
        last_name: 'Khan',
        email: 'hod.cs@university.edu.pk',
        password: staffPassword,
        role: 'hod',
        department_id: DEPT_IDS.CS,
        is_first_login: false,
        is_active: true
      },
      {
        id: USER_IDS.FINANCE,
        phone: '+923001234567',
        first_name: 'Sarah',
        last_name: 'Ahmed',
        email: 'finance.officer@university.edu.pk',
        password: staffPassword,
        role: 'finance_officer',
        department_id: DEPT_IDS.FIN,
        is_first_login: false,
        is_active: true
      },
      {
        id: USER_IDS.LIBRARY,
        phone: '+923001234567',
        first_name: 'Muhammad',
        last_name: 'Ali',
        email: 'library.officer@university.edu.pk',
        password: staffPassword,
        role: 'library_officer',
        department_id: DEPT_IDS.LIB,
        is_first_login: false,
        is_active: true
      }
    ];

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profiles, { onConflict: 'id' });

    if (profileError) throw profileError;
    console.log(`✅ ${profiles.length} Staff profiles seeded with fixed IDs.`);

    // 3. Seed Students
    console.log('\n--- Seeding Students ---');
    const students = [
      {
        phone: '+923001234567',
        first_name: 'Ali',
        last_name: 'Ahmad',
        registration_number: 'FA20-BCS-001',
        email: 'ali.ahmad@student.university.edu.pk',
        password: await bcrypt.hash('FA20-BCS-001', 12),
        department_id: DEPT_IDS.CS,
        program: 'BS',
        discipline: 'Computer Science',
        batch: '2020',
        cgpa: 3.5,
        is_first_login: true,
        is_active: true,
        clearance_status: 'not_started'
      }
    ];

    const { error: studentError } = await supabase
      .from('student_profiles')
      .upsert(students, { onConflict: 'registration_number' });

    if (studentError) throw studentError;
    console.log(`✅ Student profiles seeded.`);

    console.log('\n--- CREDENTIALS ---');
    console.log('ADMIN: admin@university.edu.pk / Admin@123');
    console.log('FINANCE: finance.officer@university.edu.pk / Staff@123');
    console.log('LIBRARY: library.officer@university.edu.pk / Staff@123');
    console.log('HOD CS: hod.cs@university.edu.pk / Staff@123');
    console.log('\n✅ Stable seeding completed!');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
  } finally {
    process.exit();
  }
}

seed();
