require('dotenv').config({ path: 'c:/Users/Hp/Downloads/clearance/university-clearance-system/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listStudents() {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('id, first_name, last_name, registration_number');
  
  if (error) {
    console.error('Error fetching students:', error.message);
  } else {
    console.log('Students:', data);
  }
}

listStudents();
