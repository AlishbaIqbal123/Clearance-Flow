require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkAllStaff() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role, department_id, full_name')
    .eq('role', 'staff');
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${users.length} staff members.`);
  
  const { data: depts } = await supabase.from('departments').select('id, name, code');
  const deptMap = depts.reduce((acc, d) => ({ ...acc, [d.id]: d }), {});
  
  users.forEach(u => {
    const dept = deptMap[u.department_id];
    console.log(`Staff: ${u.full_name} (${u.email}) -> Dept: ${dept ? `${dept.name} (${dept.code})` : 'NONE'}`);
  });
}

checkAllStaff();
