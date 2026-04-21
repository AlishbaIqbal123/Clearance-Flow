const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findStudent() {
  const { data: students } = await supabase.from('student_profiles').select('*');
  console.log('Students:', students);
  
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log('Profiles:', profiles);

  const { data: requests } = await supabase.from('clearance_requests').select('*');
  console.log('Requests:', requests);
}

findStudent();
