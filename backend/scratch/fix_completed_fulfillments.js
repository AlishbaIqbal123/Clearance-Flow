const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function fixCompletedFulfillments() {
  console.log('Starting thorough synchronization of completed fulfillments with Exam clearance status and progress...');
  
  const { data: requests, error } = await supabase
    .from('clearance_requests')
    .select('id, request_id, degree_fulfillment, student_id, status');
  
  if (error) {
    console.error('Error fetching clearance requests:', error);
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
    const isCompleted = r.status === 'fully_cleared' || 
                        (r.degree_fulfillment && (r.degree_fulfillment.status === 'completed' || r.degree_fulfillment.received_by_student === true));

    if (isCompleted) {
      console.log(`\nChecking completed Request: ${r.request_id} (UUID: ${r.id})`);
      
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
            cleared_at: (r.degree_fulfillment && (r.degree_fulfillment.completed_at || r.degree_fulfillment.received_at)) || new Date().toISOString(),
            cleared_by: r.degree_fulfillment ? (r.degree_fulfillment.completed_by || null) : null,
            remarks: 'Retroactively cleared based on completed degree fulfillment'
          })
          .eq('request_id', r.id)
          .eq('department_id', examDept.id);
      }

      // Fetch all statuses for this request to calculate progress
      const { data: allStatuses, error: statusFetchErr } = await supabase
        .from('clearance_status')
        .select('status')
        .eq('request_id', r.id);

      if (statusFetchErr) {
        console.error(`  - Error fetching statuses for request ${r.request_id}:`, statusFetchErr);
        continue;
      }

      const totalDepartments = allStatuses?.length || 0;
      const clearedDeptsCount = allStatuses?.filter(s => s.status === 'cleared').length || 0;
      const rejectedDeptsCount = allStatuses?.filter(s => s.status === 'rejected').length || 0;
      const pendingDeptsCount = totalDepartments - clearedDeptsCount - rejectedDeptsCount;

      const newProgress = {
        percentage: totalDepartments > 0 ? Math.round((clearedDeptsCount / totalDepartments) * 100) : 0,
        totalDepartments,
        clearedDepartments: clearedDeptsCount,
        pendingDepartments: pendingDeptsCount,
        rejectedDepartments: rejectedDeptsCount
      };

      console.log(`  - Updating progress to: ${newProgress.clearedDepartments}/${newProgress.totalDepartments} (${newProgress.percentage}%)`);

      // Update the request with the correct status and recalculated progress
      await supabase.from('clearance_requests')
        .update({ 
          status: 'fully_cleared',
          progress: newProgress
        })
        .eq('id', r.id);
        
      // Ensure student profile shows fully cleared
      await supabase.from('student_profiles')
        .update({ clearance_status: 'fully_cleared' })
        .eq('id', r.student_id);
    }
  }
  
  console.log('\nSynchronization complete.');
}

fixCompletedFulfillments();
