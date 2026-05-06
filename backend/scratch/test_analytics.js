const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOverviewQueries() {
  console.log('Testing Analytics Overview Queries...');
  
  try {
    const studentCountQuery = supabase.from('student_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true);
    const deptCountQuery = supabase.from('departments').select('*', { count: 'exact', head: true }).eq('is_active', true);
    const staffCountQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').eq('is_active', true);
    let requestQuery = supabase.from('clearance_requests').select('status, created_at, completed_at', { count: 'exact' });

    const [
      sCount,
      dCount,
      stCount,
      rData
    ] = await Promise.all([
      studentCountQuery,
      deptCountQuery,
      staffCountQuery,
      requestQuery
    ]);

    console.log('Students:', sCount.count, sCount.error ? `Error: ${sCount.error.message}` : '');
    console.log('Departments:', dCount.count, dCount.error ? `Error: ${dCount.error.message}` : '');
    console.log('Staff:', stCount.count, stCount.error ? `Error: ${stCount.error.message}` : '');
    console.log('Requests:', rData.count, rData.error ? `Error: ${rData.error.message}` : '');

    // Check clearance_status join
    const { data: deptStatsRaw, error: dsError } = await supabase
      .from('clearance_status')
      .select('status, cleared_at, department:department_id(name)');
    
    if (dsError) {
        console.error('Clearance Status Join Error:', dsError.message);
    } else {
        console.log('Clearance Status records with join:', deptStatsRaw?.length);
        if (deptStatsRaw?.length > 0) {
            console.log('Sample record:', JSON.stringify(deptStatsRaw[0], null, 2));
        }
    }

  } catch (e) {
    console.error('Exception during testing:', e);
  }
}

testOverviewQueries();
