require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkAllRequestStatus() {
  const { data, error } = await supabase.from('clearance_requests').select('request_id, status');
  if (error) {
    console.error(error);
    return;
  }
  
  const stats = data.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});
  
  console.log('Request Status Stats:', stats);
  data.forEach(r => {
    console.log(`- ${r.request_id}: ${r.status}`);
  });
}

checkAllRequestStatus();
