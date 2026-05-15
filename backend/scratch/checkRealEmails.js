const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkEmails() {
  console.log('Checking student_profiles for registered emails...');
  const { data: students, error } = await supabase
    .from('student_profiles')
    .select('registration_number, first_name, email')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching students:', error);
    return;
  }

  if (!students || students.length === 0) {
    console.log('No students found in the database.');
    return;
  }

  console.table(students);
}

checkEmails();
