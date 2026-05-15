require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRequests() {
  const { data: requests, error } = await supabase
    .from('clearance_requests')
    .select('*, clearance_status(*, department:department_id(name))');
  
  if (error) console.error(error);
  else {
    requests.forEach(r => {
      const statuses = r.clearance_status;
      const total = statuses.length;
      const cleared = statuses.filter(s => s.status === 'cleared').length;
      const pendingDepts = statuses.filter(s => s.status !== 'cleared').map(s => s.department?.name);
      console.log(`Request ${r.request_id}: Cleared ${cleared}/${total}. Pending: ${pendingDepts.join(', ')}`);
    });
  }
}

checkRequests();
