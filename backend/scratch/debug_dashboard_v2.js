const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  const req = {
    user: {
      id: 'b7ab1623-1280-4bb0-b805-a17f749427ca', // Admin ID from previous DB check
      role: 'admin',
      email: 'admin@university.edu.pk'
    },
    query: {}
  };

  const res = {
    status: (code) => ({
      json: (data) => console.log('Response:', code, JSON.stringify(data, null, 2))
    })
  };

  try {
    console.log('Starting dashboard logic...');
    
    // Get counts
    const { count: totalStudents } = await supabase.from('student_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true);
    const { count: totalDepartments } = await supabase.from('departments').select('*', { count: 'exact', head: true }).eq('is_active', true);
    const { count: totalStaff } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').eq('is_active', true);
    
    // Clearance statistics
    const { data: requests } = await supabase.from('clearance_requests').select('status');
    
    const clearanceMap = (requests || []).reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    
    // Recent clearance requests
    const { data: requestsRaw } = await supabase
      .from('clearance_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const studentIds = [...new Set((requestsRaw || []).map(r => r.student_id))];
    const { data: students } = await supabase
      .from('student_profiles')
      .select('id, first_name, last_name, registration_number')
      .in('id', studentIds);
    
    const recentRequests = (requestsRaw || []).map(r => ({
      ...r,
      student: students?.find(s => s.id === r.student_id)
    }));
    
    // Department-wise pending requests
    const { data: deptPendingStatsRaw } = await supabase
      .from('clearance_status')
      .select('department_id, status')
      .in('status', ['pending', 'in_review']);
    
    const pendingDeptIds = [...new Set((deptPendingStatsRaw || []).map(ps => ps.department_id))];
    const { data: pendingDepts } = await supabase
      .from('departments')
      .select('id, name')
      .in('id', pendingDeptIds);
    
    const deptPendingStatsMap = (deptPendingStatsRaw || []).reduce((acc, curr) => {
      const dept = pendingDepts?.find(d => d.id === curr.department_id);
      const name = dept?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const deptPendingStats = Object.entries(deptPendingStatsMap).map(([name, count]) => ({
      departmentName: name,
      count
    }));

    // Student distribution by department
    const { data: deptStudentStatsRaw } = await supabase
      .from('student_profiles')
      .select('department_id')
      .eq('is_active', true);

    const { data: academicDeptsRaw } = await supabase.from('departments').select('id, name').eq('type', 'academic');
    const academicDepts = (pendingDepts || []).length > 0 ? pendingDepts : academicDeptsRaw;
    
    const deptStudentStatsMap = (deptStudentStatsRaw || []).reduce((acc, curr) => {
      const dept = (academicDepts || []).find(d => d.id === curr.department_id);
      if (dept) {
        acc[dept.name] = (acc[dept.name] || 0) + 1;
      }
      return acc;
    }, {});

    const departmentStudentStats = Object.entries(deptStudentStatsMap).map(([name, count]) => ({
      name,
      count
    }));

    // Fulfillment
    let dispatchPendingCount = 0;
    let manualPickupCount = 0;
    
    const { data: fulfillmentRequests } = await supabase
      .from('clearance_requests')
      .select('degree_fulfillment')
      .not('degree_fulfillment', 'is', null);

    if (fulfillmentRequests) {
      dispatchPendingCount = fulfillmentRequests.filter(r => 
        r.degree_fulfillment && r.degree_fulfillment.method === 'dispatch'
      ).length;

      manualPickupCount = fulfillmentRequests.filter(r => 
        r.degree_fulfillment && r.degree_fulfillment.method === 'manual'
      ).length;
    }

    console.log('SUCCESS');
  } catch (err) {
    console.error('ERROR IN DASHBOARD:', err);
  }
}

debug();
