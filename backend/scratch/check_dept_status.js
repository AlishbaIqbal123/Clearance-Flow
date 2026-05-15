require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkDepartmentalStatuses(regNum) {
  const { data: student } = await supabase
    .from('student_profiles')
    .select('id, registration_number, first_name, last_name, clearance_status')
    .eq('registration_number', regNum)
    .single();
  
  if (!student) {
    console.log(`Student ${regNum} not found`);
    return;
  }
  
  console.log(`Student: ${student.first_name} ${student.last_name} (${student.registration_number})`);
  console.log(`Overall Status: ${student.clearance_status}`);
  
  const { data: requests } = await supabase
    .from('clearance_requests')
    .select('*, departments:clearance_status(*, department:department_id(name, code))')
    .eq('student_id', student.id);
  
  if (!requests || requests.length === 0) {
    console.log('No clearance requests found.');
    return;
  }
  
  for (const r of requests) {
    console.log(`Request ${r.request_id}: Status=${r.status}`);
    r.departments.forEach(cs => {
        console.log(`  - ${cs.department.name} (${cs.department.code}): ${cs.status}`);
    });
  }
}

checkDepartmentalStatuses('FA23-BSE-002'); // Alishba Iqbal
