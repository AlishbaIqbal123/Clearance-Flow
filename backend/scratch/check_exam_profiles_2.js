require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkExamStaff() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, role, department_id, first_name, last_name')
    .eq('role', 'staff');
  
  if (error) {
    console.error(error);
    return;
  }
  
  const { data: depts } = await supabase.from('departments').select('id, name, code');
  const deptMap = depts.reduce((acc, d) => ({ ...acc, [d.id]: d }), {});
  
  const examStaff = profiles.filter(p => {
    const dept = deptMap[p.department_id];
    return dept && (dept.code === 'EXD' || dept.code === 'EXAM');
  });
  
  console.log('Exam Staff:', examStaff);
}

checkExamStaff();
