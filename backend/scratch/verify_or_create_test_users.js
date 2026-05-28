const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('Fetching departments...');
  const { data: depts, error: deptsErr } = await supabase.from('departments').select('id, code');
  if (deptsErr) {
    console.error('Error fetching departments:', deptsErr);
    process.exit(1);
  }
  console.log('Departments:', depts);
  if (depts.length === 0) {
    console.error('No departments found. Please seed departments first.');
    process.exit(1);
  }
  const defaultDeptId = depts[0].id;

  // 1. Verify or create admin staff
  console.log('\nChecking admin staff...');
  const { data: staff, error: staffErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'admin@university.edu.pk')
    .maybeSingle();

  if (staffErr) {
    console.error('Error fetching admin staff:', staffErr);
  }

  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);

  if (!staff) {
    console.log('Admin staff not found. Creating...');
    const { data: newStaff, error: createStaffErr } = await supabase
      .from('profiles')
      .insert([{
        email: 'admin@university.edu.pk',
        password: hashedAdminPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        department_id: defaultDeptId,
        is_first_login: false
      }])
      .select()
      .single();
    if (createStaffErr) {
      console.error('Error creating admin staff:', createStaffErr);
    } else {
      console.log('Created admin staff successfully:', newStaff);
    }
  } else {
    console.log('Admin staff found. Updating password and ensuring active status...');
    const { error: updateStaffErr } = await supabase
      .from('profiles')
      .update({
        password: hashedAdminPassword,
        is_active: true,
        role: 'admin',
        is_first_login: false
      })
      .eq('email', 'admin@university.edu.pk');
    if (updateStaffErr) {
      console.error('Error updating admin staff:', updateStaffErr);
    } else {
      console.log('Admin staff updated successfully.');
    }
  }

  // 2. Verify or create student
  console.log('\nChecking student...');
  const { data: student, error: studentErr } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('email', 'student1@university.edu.pk')
    .maybeSingle();

  if (studentErr) {
    console.error('Error fetching student:', studentErr);
  }

  const hashedStudentPassword = await bcrypt.hash('Student@123', 10);

  if (!student) {
    console.log('Student not found. Creating...');
    const { data: newStudent, error: createStudentErr } = await supabase
      .from('student_profiles')
      .insert([{
        email: 'student1@university.edu.pk',
        registration_number: 'TEST-STUDENT1-REG',
        password: hashedStudentPassword,
        first_name: 'Student',
        last_name: 'One',
        is_active: true,
        department_id: defaultDeptId,
        phone: '+923001234567',
        is_first_login: false,
        program: 'BSCS',
        discipline: 'Computer Science',
        batch: 'FA20',
        semester: '8th',
        clearance_status: 'pending'
      }])
      .select()
      .single();
    if (createStudentErr) {
      console.error('Error creating student:', createStudentErr);
    } else {
      console.log('Created student successfully:', newStudent);
    }
  } else {
    console.log('Student found. Updating password and ensuring active status...');
    const { error: updateStudentErr } = await supabase
      .from('student_profiles')
      .update({
        password: hashedStudentPassword,
        is_active: true,
        is_first_login: false
      })
      .eq('email', 'student1@university.edu.pk');
    if (updateStudentErr) {
      console.error('Error updating student:', updateStudentErr);
    } else {
      console.log('Student updated successfully.');
    }
  }

  process.exit(0);
}

run();
