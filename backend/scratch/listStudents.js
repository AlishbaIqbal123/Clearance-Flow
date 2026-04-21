require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listStudents() {
  const { data, error } = await supabase.from('student_profiles').select('id, first_name, last_name, registration_number');
  if (data) console.log(JSON.stringify(data, null, 2));
  else console.error(error);
}

listStudents();
