const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findStudentByEmail(email) {
  console.log(`Searching for student with email: ${email}`);
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Error fetching student:', error.message);
  } else if (!data) {
    console.log('No student found with that email.');
  } else {
    console.log('Student found:', data);
  }
}

const email = process.argv[2] || 'i.alishba1342@gmail.com';
findStudentByEmail(email);
