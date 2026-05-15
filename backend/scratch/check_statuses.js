require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkStatuses() {
  const { data, error } = await supabase
    .from('clearance_requests')
    .select('status')
    .limit(100);
  
  if (error) {
    console.error(error);
    return;
  }
  
  const statuses = [...new Set(data.map(s => s.status))];
  console.log('Unique statuses in clearance_requests:', statuses);
}

checkStatuses();
