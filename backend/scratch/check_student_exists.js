const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudent() {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('registration_number', 'FA20-BCS-001')
    .single();

  if (error) {
    console.error('Error fetching student:', error.message);
  } else {
    console.log('Student found:', data);
  }
}

checkStudent();
