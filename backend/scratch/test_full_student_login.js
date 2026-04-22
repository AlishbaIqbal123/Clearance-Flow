const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testStudentLogin() {
  const registrationNumber = 'FA20-BCS-001';
  const password = 'FA20-BCS-001';

  console.log(`Testing login for ${registrationNumber}...`);

  let query = supabase
    .from('student_profiles')
    .select('*, department:department_id(*)');

  query = query.eq('registration_number', registrationNumber.toUpperCase());

  const { data: student, error } = await query.single();

  if (error || !student) {
    console.error('Lookup failed:', error);
    return;
  }

  console.log('Student found:', student.registration_number);
  
  const isMatch = await bcrypt.compare(password, student.password);
  console.log('Password match:', isMatch);

  if (!isMatch) {
    console.log('Comparing with lowercase...');
    const isMatchLower = await bcrypt.compare(password.toLowerCase(), student.password);
    console.log('Lowercase password match:', isMatchLower);
  }
}

testStudentLogin();
