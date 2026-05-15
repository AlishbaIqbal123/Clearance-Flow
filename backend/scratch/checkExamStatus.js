require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStatus() {
  const deptId = '39d23a58-27cb-4a81-8a01-de4bae6c68dc'; // Exam ID
  const { data, error, count } = await supabase
    .from('clearance_status')
    .select('*, request:request_id(*)', { count: 'exact' })
    .eq('department_id', deptId);
  
  if (error) console.error(error);
  else {
    console.log(`Count for Exam: ${count}`);
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
  }
}

checkStatus();
