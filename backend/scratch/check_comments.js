require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkComments(regNum) {
  const { data: student } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('registration_number', regNum)
    .single();
  
  if (!student) return;
  
  const { data: request } = await supabase
    .from('clearance_requests')
    .select('comments')
    .eq('student_id', student.id)
    .single();
  
  console.log(`Comments for ${regNum}:`, JSON.stringify(request.comments, null, 2));
}

checkComments('FA23-BSE-002');
