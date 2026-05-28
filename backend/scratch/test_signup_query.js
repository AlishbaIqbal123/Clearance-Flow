const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function testQuery() {
  const registrationNumber = 'FA21-BCS-999';
  const email = 'nonexistent_test_student@university.edu.pk';

  console.log('Running select check...');
  try {
    const { data: existingStudent, error } = await supabase
      .from('student_profiles')
      .select('id')
      .or(`registration_number.eq.${registrationNumber.toUpperCase()},email.eq.${email.toLowerCase()}`)
      .single();

    console.log('Result data:', existingStudent);
    console.log('Result error:', error);
  } catch (err) {
    console.error('Caught error directly:', err);
  }
  process.exit(0);
}

testQuery();
