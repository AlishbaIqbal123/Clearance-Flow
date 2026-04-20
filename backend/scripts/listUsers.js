const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listUsers() {
  console.log('Fetching all users from profiles...');
  const { data: users, error } = await supabase.from('profiles').select('*');
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log(`Found ${users.length} users:`);
  users.forEach(u => {
    console.log(`- Email: "${u.email}", Role: ${u.role}, Active: ${u.is_active}`);
  });

  console.log('Fetching all students from student_profiles...');
  const { data: students, error: sError } = await supabase.from('student_profiles').select('*');
  if (sError) {
    console.error('Error:', sError.message);
    return;
  }
  console.log(`Found ${students.length} students:`);
  students.forEach(s => {
    console.log(`- Reg #: "${s.registration_number}", Email: "${s.email}"`);
  });
}

listUsers();
