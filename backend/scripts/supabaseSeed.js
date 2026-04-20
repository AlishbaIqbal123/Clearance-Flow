const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndSeed() {
  console.log('Checking database...');
  
  const salt = await bcrypt.genSalt(12);

  // 1. Seed Departments (needed for relationships)
  console.log('Seeding Departments...');
  const departments = [
    { code: 'CS', name: 'Computer Science', type: 'academic', is_active: true },
    { code: 'EE', name: 'Electrical Engineering', type: 'academic', is_active: true },
    { code: 'FIN', name: 'Finance Office', type: 'administrative', is_active: true },
    { code: 'LIB', name: 'Central Library', type: 'administrative', is_active: true }
  ];

  for (const dept of departments) {
    const { data: existingDept } = await supabase.from('departments').select('id').eq('code', dept.code).single();
    if (!existingDept) {
      await supabase.from('departments').insert([dept]);
    }
  }

  const { data: deptList } = await supabase.from('departments').select('*');
  const csDept = deptList.find(d => d.code === 'CS');
  const finDept = deptList.find(d => d.code === 'FIN');

  // 2. Hash default passwords
  const adminPwd = await bcrypt.hash('Admin@123', salt);
  const staffPwd = await bcrypt.hash('Staff@123', salt);
  const studentPwd = await bcrypt.hash('FA20-BCS-001', salt);

  // 3. Seed Admin
  console.log('Seeding Admin...');
  await supabase.from('profiles').upsert([
    {
      email: 'admin@university.edu.pk',
      password: adminPwd,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      is_active: true,
      is_first_login: false
    }
  ], { onConflict: 'email' });

  // 4. Seed Staff (HOD/Finance)
  console.log('Seeding Staff...');
  await supabase.from('profiles').upsert([
    {
      email: 'ahmed.khan@university.edu.pk',
      password: staffPwd,
      first_name: 'Ahmed',
      last_name: 'Khan',
      role: 'hod',
      department_id: csDept?.id,
      is_active: true,
      is_first_login: false
    },
    {
      email: 'fatima.ali@university.edu.pk',
      password: staffPwd,
      first_name: 'Fatima',
      last_name: 'Ali',
      role: 'finance_officer',
      department_id: finDept?.id,
      is_active: true,
      is_first_login: false
    }
  ], { onConflict: 'email' });

  // 5. Seed Student (Match Test Credentials)
  console.log('Seeding Student...');
  const testStudentPwd = await bcrypt.hash('Student@123', salt);
  await supabase.from('student_profiles').upsert([
    {
      registration_number: 'FA20-BCS-001',
      password: testStudentPwd,
      email: 'student1@university.edu.pk',
      first_name: 'Test',
      last_name: 'Student',
      program: 'BSCS',
      batch: '2020',
      discipline: 'Computer Science',
      department_id: csDept?.id,
      is_active: true,
      is_first_login: false
    }
  ], { onConflict: 'registration_number' });

  console.log('Check/Seed complete.');
}

checkAndSeed();
