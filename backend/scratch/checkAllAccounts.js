const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Use SERVICE_ROLE_KEY to bypass Row Level Security (RLS) policies
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkEmails() {
  console.log('Checking student_profiles and profiles for existing accounts (Bypassing RLS)...');
  
  const { data: students, error: studentError } = await supabase
    .from('student_profiles')
    .select('registration_number, first_name, email')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: staff, error: staffError } = await supabase
    .from('profiles')
    .select('id, first_name, email, role')
    .order('created_at', { ascending: false })
    .limit(5);

  if (studentError) console.error('Error fetching students:', studentError);
  if (staffError) console.error('Error fetching staff:', staffError);

  console.log('--- STUDENTS ---');
  if (students && students.length > 0) {
    console.table(students);
  } else {
    console.log('No students found.');
  }

  console.log('--- STAFF ---');
  if (staff && staff.length > 0) {
    console.table(staff);
  } else {
    console.log('No staff found.');
  }
}

checkEmails();
