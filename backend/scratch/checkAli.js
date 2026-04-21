require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAliData() {
  const studentId = 'b432ff92-02cb-4db9-a060-b7d4a3b0818d';
  
  // 1. Get active request
  const { data: request } = await supabase
    .from('clearance_requests')
    .select('*')
    .eq('student_id', studentId)
    .not('status', 'in', '("cancelled","cleared")')
    .single();

  if (!request) {
    console.log('No active request found');
    return;
  }

  // 2. Get statuses
  const { data: statuses } = await supabase
    .from('clearance_status')
    .select('*')
    .eq('request_id', request.id);

  console.log('Statuses found:', statuses.length);

  // 3. Get Departments
  const deptIds = statuses.map(s => s.department_id);
  console.log('Dept IDs from statuses:', deptIds);

  const { data: depts } = await supabase
    .from('departments')
    .select('id, name, code')
    .in('id', deptIds);

  console.log('Depts fetched:', depts.length);
  console.log('Sample Dept:', depts[0]);

  // 4. Test mapping
  const mapped = statuses.map(s => ({
    status_id: s.id,
    dept_id: s.department_id,
    dept_match: depts.find(d => d.id === s.department_id)
  }));

  console.log('Mapping example:', mapped[0]);
}

checkAliData();
