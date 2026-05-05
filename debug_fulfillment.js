const supabase = require('./backend/config/supabase');

async function debugAliAhmad() {
  const { data: students } = await supabase
    .from('student_profiles')
    .select('id, first_name, last_name, registration_number')
    .ilike('first_name', '%Ali%')
    .ilike('last_name', '%Ahmad%');
  
  console.log('Students found:', students);

  if (students && students.length > 0) {
    for (const student of students) {
      const { data: requests } = await supabase
        .from('clearance_requests')
        .select('id, status, degree_fulfillment, created_at')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });
      
      console.log(`Requests for ${student.first_name}:`, requests);
    }
  }
}

debugAliAhmad();
