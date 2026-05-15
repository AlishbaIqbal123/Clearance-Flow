require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkStudentProgress(regNum) {
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
  console.log(`Current Overall Status: ${student.clearance_status}`);
  
  const { data: requests } = await supabase
    .from('clearance_requests')
    .select('*, clearance_status(*, department:department_id(name, code))')
    .eq('student_id', student.id);
  
  if (!requests || requests.length === 0) {
    console.log('No clearance requests found.');
    return;
  }
  
  for (const r of requests) {
    const total = r.clearance_status.length;
    const cleared = r.clearance_status.filter(s => s.status === 'cleared').length;
    console.log(`Request ${r.request_id}: Status=${r.status}, Progress=${cleared}/${total}`);
    r.clearance_status.forEach(cs => {
        console.log(`  - ${cs.department.name} (${cs.department.code}): ${cs.status}`);
    });
  }
}

checkStudentProgress('FA23-BSCS-21'); // Abdullah Wali
