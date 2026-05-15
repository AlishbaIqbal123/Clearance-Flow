require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function syncAllStatuses() {
  console.log('Starting global status synchronization...');
  
  const { data: requests, error } = await supabase
    .from('clearance_requests')
    .select('*, clearance_status(*)');
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Auditing ${requests.length} requests...`);
  
  for (const r of requests) {
    const total = r.clearance_status.length;
    const cleared = r.clearance_status.filter(s => s.status === 'cleared').length;
    const rejected = r.clearance_status.filter(s => s.status === 'rejected').length;
    
    let targetStatus = 'in_progress';
    if (rejected > 0) targetStatus = 'rejected';
    else if (cleared === total && total > 0) targetStatus = 'fully_cleared';
    else if (cleared > 0) targetStatus = 'partially_cleared';
    
    if (r.status !== targetStatus) {
      console.log(`Fixing Request ${r.request_id}: ${r.status} -> ${targetStatus}`);
      await supabase.from('clearance_requests')
        .update({ status: targetStatus })
        .eq('id', r.id);
      
      await supabase.from('student_profiles')
        .update({ clearance_status: targetStatus })
        .eq('id', r.student_id);
    }
  }
  
  console.log('Synchronization complete.');
}

syncAllStatuses();
