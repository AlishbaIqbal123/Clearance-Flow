require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function fixCompletedFulfillments() {
  console.log('Synchronizing completed fulfillments with Exam clearance status...');
  
  const { data: requests, error } = await supabase
    .from('clearance_requests')
    .select('id, request_id, degree_fulfillment, student_id');
  
  if (error) {
    console.error(error);
    return;
  }
  
  const { data: examDept } = await supabase
    .from('departments')
    .select('id')
    .or('code.eq.EXD,code.eq.EXAM')
    .single();
    
  if (!examDept) {
    console.log('Exam department not found.');
    return;
  }
  
  for (const r of requests) {
    if (r.degree_fulfillment && r.degree_fulfillment.status === 'completed') {
      console.log(`Checking Request ${r.request_id}...`);
      
      const { data: status } = await supabase
        .from('clearance_status')
        .select('status')
        .eq('request_id', r.id)
        .eq('department_id', examDept.id)
        .single();
        
      if (status && status.status !== 'cleared') {
        console.log(`  - Fixing Exam status: ${status.status} -> cleared`);
        await supabase.from('clearance_status')
          .update({
            status: 'cleared',
            cleared_at: r.degree_fulfillment.completed_at || new Date().toISOString(),
            cleared_by: r.degree_fulfillment.completed_by,
            remarks: 'Retroactively cleared based on completed degree fulfillment'
          })
          .eq('request_id', r.id)
          .eq('department_id', examDept.id);
        
        // Also ensure overall status is correct
        await supabase.from('clearance_requests')
          .update({ status: 'fully_cleared' })
          .eq('id', r.id);
          
        await supabase.from('student_profiles')
          .update({ clearance_status: 'fully_cleared' })
          .eq('id', r.student_id);
      }
    }
  }
  
  console.log('Synchronization complete.');
}

fixCompletedFulfillments();
