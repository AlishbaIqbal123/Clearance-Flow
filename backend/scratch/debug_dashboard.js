const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDashboard() {
  console.log('Debugging Admin Dashboard Query...');
  
  try {
    console.log('1. Fetching counts...');
    const { count: totalStudents } = await supabase.from('student_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true);
    console.log('Students:', totalStudents);

    const { count: totalDepartments } = await supabase.from('departments').select('*', { count: 'exact', head: true }).eq('is_active', true);
    console.log('Departments:', totalDepartments);

    const { count: totalStaff } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').eq('is_active', true);
    console.log('Staff:', totalStaff);
    
    console.log('2. Fetching requests...');
    const { data: requests } = await supabase.from('clearance_requests').select('status');
    console.log('Requests count:', requests?.length);
    
    const clearanceMap = (requests || []).reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('3. Fetching recent requests...');
    const { data: requestsRaw } = await supabase
      .from('clearance_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const studentIds = [...new Set((requestsRaw || []).map(r => r.student_id))];
    console.log('Unique students in recent requests:', studentIds.length);

    const { data: students } = await supabase
      .from('student_profiles')
      .select('id, first_name, last_name, registration_number')
      .in('id', studentIds);
    console.log('Students fetched:', students?.length);
    
    const recentRequests = (requestsRaw || []).map(r => ({
      ...r,
      student: students?.find(s => s.id === r.student_id)
    }));
    
    console.log('4. Department-wise pending stats...');
    const { data: deptPendingStatsRaw } = await supabase
      .from('clearance_status')
      .select('department_id, status')
      .in('status', ['pending', 'in_review']);
    console.log('Pending stats raw:', deptPendingStatsRaw?.length);
    
    const pendingDeptIds = [...new Set((deptPendingStatsRaw || []).map(ps => ps.department_id))];
    const { data: pendingDepts } = await supabase
      .from('departments')
      .select('id, name')
      .in('id', pendingDeptIds);
    console.log('Pending departments:', pendingDepts?.length);
    
    const deptPendingStatsMap = (deptPendingStatsRaw || []).reduce((acc, curr) => {
      const dept = pendingDepts?.find(d => d.id === curr.department_id);
      const name = dept?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    console.log('5. Student distribution by department...');
    const { data: deptStudentStatsRaw } = await supabase
      .from('student_profiles')
      .select('department_id')
      .eq('is_active', true);

    const { data: academicDepts } = await supabase.from('departments').select('id, name').eq('type', 'academic');
    
    const deptStudentStatsMap = (deptStudentStatsRaw || []).reduce((acc, curr) => {
      const dept = (academicDepts || []).find(d => d.id === curr.department_id);
      if (dept) {
        acc[dept.name] = (acc[dept.name] || 0) + 1;
      }
      return acc;
    }, {});

    console.log('6. Fulfillment stats...');
    let dispatchPendingCount = 0;
    let manualPickupCount = 0;
    
    const { data: fulfillmentRequests, error: fulfillmentError } = await supabase
      .from('clearance_requests')
      .select('degree_fulfillment')
      .not('degree_fulfillment', 'is', null);

    if (fulfillmentError) {
      console.log('Fulfillment Error (expected if column missing):', fulfillmentError.message);
    } else {
      console.log('Fulfillment records:', fulfillmentRequests?.length);
      if (fulfillmentRequests) {
        dispatchPendingCount = fulfillmentRequests.filter(r => 
          r.degree_fulfillment && r.degree_fulfillment.method === 'dispatch'
        ).length;

        manualPickupCount = fulfillmentRequests.filter(r => 
          r.degree_fulfillment && r.degree_fulfillment.method === 'manual'
        ).length;
      }
    }

    console.log('Final Result Construction Success!');

  } catch (e) {
    console.error('Exception during debugging:', e);
    console.error(e.stack);
  }
}

debugDashboard();
