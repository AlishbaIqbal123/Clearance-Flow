const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function fixStudentDepartment() {
  const studentReg = 'FA23-BSE-002';
  const newDeptName = 'Software Engineering';

  console.log(`Fixing department for student ${studentReg}...`);

  // 1. Get Department ID
  const { data: dept, error: deptError } = await supabase
    .from('departments')
    .select('id')
    .eq('name', newDeptName)
    .single();

  if (deptError || !dept) {
    console.error('Error finding department:', deptError);
    process.exit(1);
  }

  console.log(`Found ${newDeptName} ID: ${dept.id}`);

  // 2. Update Student Profile
  const { data: student, error: studentError } = await supabase
    .from('student_profiles')
    .update({ department_id: dept.id })
    .eq('registration_number', studentReg)
    .select()
    .single();

  if (studentError) {
    console.error('Error updating student profile:', studentError);
    process.exit(1);
  }

  console.log(`Successfully updated student ${studentReg} to department ${newDeptName}`);

  // 3. Optional: Update existing clearance requests if any
  // For simplicity, we assume the student will start fresh or the UI will reflect the change
  // Actually, let's check for active requests
  const { data: requests, error: reqError } = await supabase
    .from('clearance_requests')
    .select('id')
    .eq('student_id', student.id)
    .eq('status', 'pending');

  if (requests && requests.length > 0) {
    console.log(`Found ${requests.length} pending requests. Updating clearance statuses...`);
    for (const req of requests) {
      // Find the "Computer Science" status and change it to "Software Engineering"
      // This is complex because we'd need to swap the department_id in clearance_statuses
      // Let's just alert the user that existing requests might need manual adjustment or restart
      console.log(`Request ID: ${req.id} might need manual department swap in clearance_statuses.`);
    }
  }

  process.exit(0);
}

fixStudentDepartment();
