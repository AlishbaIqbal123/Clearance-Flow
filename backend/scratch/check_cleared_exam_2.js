require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkClearedExamRequests() {
  const examDeptId = '39d23a58-27cb-4a81-8a01-de4bae6c68dc';
  
  const { data, error } = await supabase
    .from('clearance_status')
    .select('request_id, status, cleared_at, request:request_id(request_id)')
    .eq('department_id', examDeptId)
    .eq('status', 'cleared');
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${data.length} cleared exam requests.`);
  data.forEach(d => {
    console.log(`- Request ${d.request.request_id} cleared at ${d.cleared_at}`);
  });
}

checkClearedExamRequests();
