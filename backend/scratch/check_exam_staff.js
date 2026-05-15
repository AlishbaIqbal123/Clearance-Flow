require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkExamStaff() {
  const { data: depts } = await supabase
    .from('departments')
    .select('id, name, code')
    .in('code', ['EXD', 'EXAM']);
  
  if (!depts || depts.length === 0) {
    console.log('No exam departments found.');
    return;
  }
  
  const deptIds = depts.map(d => d.id);
  console.log('Exam Dept IDs:', deptIds);
  
  const { data: staff } = await supabase
    .from('users')
    .select('id, email, role, department_id')
    .in('department_id', deptIds);
  
  console.log('Exam Staff:', staff);
}

checkExamStaff();
