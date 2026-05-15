require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkPendingStudents() {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('registration_number, first_name, last_name, clearance_status')
    .eq('clearance_status', 'pending');
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log('Students with "pending" status:', data);
  
  if (data.length > 0) {
    // Check their clearance requests
    const { data: requests, error: reqError } = await supabase
      .from('clearance_requests')
      .select('*, student:student_id(registration_number), clearance_status(*)')
      .in('student_id', data.map(s => s.id)); // Wait, I need IDs
  }
}

async function checkPendingWithIds() {
    const { data: students, error } = await supabase
      .from('student_profiles')
      .select('id, registration_number, first_name, last_name, clearance_status')
      .eq('clearance_status', 'pending');
    
    if (error) {
      console.error(error);
      return;
    }
    
    console.log(`Found ${students.length} pending students.`);
    
    for (const student of students) {
        const { data: requests } = await supabase
            .from('clearance_requests')
            .select('*, clearance_status(*)')
            .eq('student_id', student.id);
            
        console.log(`Student ${student.registration_number} has ${requests?.length || 0} requests.`);
        if (requests) {
            requests.forEach(r => {
                const cleared = r.clearance_status.filter(s => s.status === 'cleared').length;
                const total = r.clearance_status.length;
                console.log(`  Request ${r.request_id}: Status=${r.status}, Progress=${cleared}/${total}`);
            });
        }
    }
}

checkPendingWithIds();
