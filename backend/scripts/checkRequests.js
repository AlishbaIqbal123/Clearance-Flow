const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRequests() {
  console.log('--- Fetching all Clearance Requests ---');
  const { data: requests, error } = await supabase.from('clearance_requests').select('*, student:student_id(registration_number, email)');
  
  if (error) {
    console.error('Error fetching clearance requests:', error.message);
    return;
  }

  console.log(`Found ${requests.length} clearance requests:`);
  requests.forEach(r => {
    console.log(`- Request ID: ${r.request_id}, ID: ${r.id}, Student: ${r.student?.registration_number}, Status: ${r.status}, Created: ${r.created_at}`);
  });

  console.log('\n--- Fetching all Clearance Status entries ---');
  const { data: statuses, error: sError } = await supabase
    .from('clearance_status')
    .select('*, department:department_id(name, code)');
  
  if (sError) {
    console.error('Error fetching clearance status:', sError.message);
    return;
  }

  console.log(`Found ${statuses.length} status entries:`);
  if (statuses.length > 0) {
    statuses.slice(0, 10).forEach(s => {
      console.log(`- Request UUID: ${s.request_id}, Dept: ${s.department?.name} (${s.department?.code}), Status: ${s.status}`);
    });
    if (statuses.length > 10) {
      console.log(`... and ${statuses.length - 10} more entries.`);
    }
  }
}

checkRequests();
