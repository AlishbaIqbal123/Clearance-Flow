const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTasks() {
  const { data: hod } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, role, department_id, department:department_id(name)')
    .ilike('first_name', '%Muhammad%')
    .ilike('last_name', '%Abdullah%')
    .single();

  console.log('HOD Found:', hod);

  const { data: request } = await supabase
    .from('clearance_requests')
    .select('id, request_id, status, student_id')
    .eq('request_id', 'CLR-MO5LJNHK-O841')
    .single();

  console.log('Request Found:', request);

  if (request) {
    const { data: statuses } = await supabase
      .from('clearance_status')
      .select('id, request_id, department_id, status, department:department_id(name)')
      .eq('request_id', request.id);

    console.log('Clearance Statuses:', statuses);
    
    if (hod && statuses) {
      const matchingStatus = statuses.find(s => s.department_id === hod.department_id);
      console.log('Matching Status for HOD Dept:', matchingStatus);
    }
  }
}

checkTasks();
