require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const studentId = 'b432ff92-02cb-4db9-a060-b7d4a3b0818d';

async function test() {
  console.log('\n=== SIMULATING GET /api/students/dashboard ===\n');

  // Step 1: Fetch student profile (same as authenticate middleware + dashboard)
  const { data: student, error: e1 } = await supabase
    .from('student_profiles')
    .select('*, department:department_id(name, code)')
    .eq('id', studentId)
    .single();
  console.log('1. Student fetch:', student ? `OK (name: ${student.first_name} ${student.last_name}, dept_id: ${student.department_id})` : 'NULL');
  if (e1) console.error('   ERROR:', JSON.stringify(e1));

  // Step 2: Active clearance requests (using the exact query from the route)
  const { data: activeRequests, error: e2 } = await supabase
    .from('clearance_requests')
    .select('*')
    .eq('student_id', studentId)
    .not('status', 'in', '("cancelled","cleared")')
    .order('created_at', { ascending: false });
  console.log('2. Active requests:', activeRequests ? `${activeRequests.length} found` : 'NULL');
  if (e2) console.error('   ERROR:', JSON.stringify(e2));

  // Step 3: Clearance history
  const { data: historyRaw, error: e3 } = await supabase
    .from('clearance_requests')
    .select('*')
    .eq('student_id', studentId)
    .in('status', ['cleared', 'cancelled', 'rejected'])
    .order('created_at', { ascending: false })
    .limit(5);
  console.log('3. History:', historyRaw ? `${historyRaw.length} items` : 'NULL');
  if (e3) console.error('   ERROR:', JSON.stringify(e3));

  // Step 4: Departments
  const { data: allDepts, error: e4 } = await supabase
    .from('departments')
    .select('*')
    .eq('is_active', true)
    .order('name');
  console.log('4. Departments:', allDepts ? `${allDepts.length} found` : 'NULL');
  if (e4) console.error('   ERROR:', JSON.stringify(e4));

  // Step 5: If active request found, fetch statuses
  const activeRequest = activeRequests?.[0] || null;
  if (activeRequest) {
    console.log('\n   Active Request found:', activeRequest.id);
    const { data: statuses, error: e5 } = await supabase
      .from('clearance_status')
      .select('*')
      .eq('request_id', activeRequest.id);
    console.log('5. Clearance statuses:', statuses ? `${statuses.length} found` : 'NULL');
    if (e5) console.error('   ERROR:', JSON.stringify(e5));
  } else {
    console.log('\n   No active request → canSubmitNewRequest = true');
  }

  console.log('\n=== SUMMARY ===');
  const hasErrors = [e1, e2, e3, e4].some(Boolean);
  if (hasErrors) {
    console.log('❌ Some queries failed — see errors above');
  } else {
    console.log('✅ All queries succeeded — dashboard should load');
    console.log('   Student ID (registration_number):', student?.registration_number);
    console.log('   Department:', student?.department?.name || 'N/A');
  }
}

test().catch(err => {
  console.error('FATAL:', err.message);
}).finally(() => setTimeout(() => process.exit(0), 500));
