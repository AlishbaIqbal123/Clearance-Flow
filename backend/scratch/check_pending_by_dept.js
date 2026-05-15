require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkPendingByDept() {
  const { data: deptPendingStatsRaw } = await supabase
    .from('clearance_status')
    .select('department_id, status, request_id, request:request_id(request_id)')
    .in('status', ['pending', 'in_review']);
    
  console.log(`Found ${deptPendingStatsRaw.length} pending/in_review status entries.`);
  
  for (const entry of deptPendingStatsRaw) {
      console.log(`- Request ${entry.request.request_id} is ${entry.status} in dept ${entry.department_id}`);
  }
}

checkPendingByDept();
