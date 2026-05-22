const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('Simulating admin user overview analytics...');
  
  const studentCountQuery = supabase.from('student_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const deptCountQuery = supabase.from('departments').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const staffCountQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').eq('is_active', true);
  const requestQuery = supabase.from('clearance_requests').select('status, created_at, completed_at, student:student_id(department_id)', { count: 'exact' });

  const [
    rStudents,
    rDepts,
    rStaff,
    rRequests
  ] = await Promise.all([
    studentCountQuery,
    deptCountQuery,
    staffCountQuery,
    requestQuery
  ]);

  console.log('Query results:');
  console.log('studentCountQuery count:', rStudents.count, 'error:', rStudents.error);
  console.log('deptCountQuery count:', rDepts.count, 'error:', rDepts.error);
  console.log('staffCountQuery count:', rStaff.count, 'error:', rStaff.error);
  console.log('requestQuery count:', rRequests.count, 'error:', rRequests.error);
  console.log('requests data:', rRequests.data);

  if (rRequests.data) {
    const statusBreakdown = rRequests.data.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    console.log('Status breakdown:', statusBreakdown);
  }

  // Department performance
  const { data: deptStatsRaw, error: deptStatsErr } = await supabase
    .from('clearance_status')
    .select('status, cleared_at, department:department_id(name, id)');
  console.log('deptStatsRaw length:', deptStatsRaw ? deptStatsRaw.length : 0, 'error:', deptStatsErr);
  if (deptStatsRaw && deptStatsRaw.length > 0) {
    console.log('Sample deptStatsRaw:', deptStatsRaw[0]);
  }
}

run();
