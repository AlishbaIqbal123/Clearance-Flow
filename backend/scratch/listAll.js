const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listAll() {
  const { data: requests } = await supabase
    .from('clearance_requests')
    .select('id, request_id, status, student_id, student:student_id(first_name, last_name)')
    .limit(5);

  console.log('Recent Requests:', requests);
}

listAll();
