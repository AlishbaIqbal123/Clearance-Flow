require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDept() {
  const deptId = '7b0a710a-3092-2709-9d4b-b79a91339340';
  const { data: dept, error } = await supabase.from('departments').select('*').eq('id', deptId).single();
  console.log('Department:', dept);
  console.log('Error:', error);

  const { data: requests, error: err2 } = await supabase
    .from('clearance_requests')
    .select('*, clearance_status!inner(*)')
    .eq('clearance_status.department_id', deptId);
  
  console.log('Requests Count:', requests?.length);
  console.log('Query Error:', err2);
}

checkDept();
