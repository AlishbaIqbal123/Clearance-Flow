const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStudent() {
  const regNo = 'FA20-BCS-001';
  console.log(`Checking student: ${regNo}`);
  
  const { data: student, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('registration_number', regNo)
    .single();

  if (error) {
    console.error('Error finding student:', error);
  } else {
    console.log('Student found:', student.registration_number);
    console.log('Is Active:', student.is_active);
    console.log('Password hash exists:', !!student.password);
  }

  console.log('\nChecking all students to see what is there...');
  const { data: allStudents, error: allErr } = await supabase
    .from('student_profiles')
    .select('registration_number, email');
  
  if (allErr) {
    console.error('Error fetching all students:', allErr);
  } else {
    console.log('Students in DB:', allStudents.map(s => s.registration_number));
  }
}

checkStudent();
