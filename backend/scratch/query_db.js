const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function run() {
  try {
    console.log('Fetching departments...');
    const { data: depts, error: deptsErr } = await supabase
      .from('departments')
      .select('id, name, code, type');
    if (deptsErr) throw deptsErr;
    console.log('Departments:', depts);

    console.log('\nFetching request CLR-FA20-BCS-021...');
    const { data: requests, error: reqErr } = await supabase
      .from('clearance_requests')
      .select('*')
      .eq('request_id', 'CLR-FA20-BCS-021');
    if (reqErr) throw reqErr;
    console.log('Clearance Request:', requests);

    if (requests && requests.length > 0) {
      const reqId = requests[0].id;
      console.log(`\nFetching clearance status entries for request UUID: ${reqId}...`);
      const { data: statuses, error: statusErr } = await supabase
        .from('clearance_status')
        .select('*, department:department_id(name, code)')
        .eq('request_id', reqId);
      if (statusErr) throw statusErr;
      console.log('Clearance Status Entries:');
      statuses.forEach(s => {
        console.log(`- Dept: ${s.department?.name} (${s.department?.code}), Status: ${s.status}, Due: ${s.due_amount}`);
      });
    }
  } catch (err) {
    console.error('Error running script:', err);
  }
}

run();
