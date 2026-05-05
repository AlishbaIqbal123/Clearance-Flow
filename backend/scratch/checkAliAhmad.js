import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStudent() {
  const regNo = 'FA20-BCS-001';
  console.log(`Checking statuses for student: ${regNo}`);
  
  // Get student ID
  const { data: student } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('registration_number', regNo)
    .single();

  if (!student) {
    console.log('Student not found');
    return;
  }

  // Get request ID
  const { data: request } = await supabase
    .from('clearance_requests')
    .select('id')
    .eq('student_id', student.id)
    .single();

  if (!request) {
    console.log('No clearance request found for this student');
    return;
  }

  // Get all statuses
  const { data: statuses } = await supabase
    .from('clearance_status')
    .select('status, department:department_id(name, type)')
    .eq('request_id', request.id);

  console.log('Statuses found:');
  statuses.forEach(s => {
    console.log(`- ${s.department.name} (${s.department.type}): ${s.status}`);
  });
}

checkStudent();
