require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkPendingRequests() {
  const { data: requests, error } = await supabase
    .from('clearance_requests')
    .select('*, student:student_id(registration_number, first_name, last_name), clearance_status(*)')
    .eq('status', 'pending');
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${requests.length} pending requests.`);
  
  for (const r of requests) {
    const cleared = r.clearance_status.filter(s => s.status === 'cleared').length;
    const total = r.clearance_status.length;
    console.log(`Request ${r.request_id} (Student ${r.student.registration_number}): Progress=${cleared}/${total}`);
    if (cleared === total && total > 0) {
        console.log(`  >>> THIS REQUEST SHOULD BE FULLY CLEARED!`);
    }
  }
}

checkPendingRequests();
