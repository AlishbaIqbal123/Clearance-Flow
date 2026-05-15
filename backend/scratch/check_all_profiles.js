require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkAllProfiles() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, role, department_id, first_name, last_name');
  
  if (error) {
    console.error(error);
    return;
  }
  
  const { data: depts } = await supabase.from('departments').select('id, name, code');
  const deptMap = depts.reduce((acc, d) => ({ ...acc, [d.id]: d }), {});
  
  profiles.forEach(p => {
    const dept = deptMap[p.department_id];
    console.log(`${p.first_name} ${p.last_name} (${p.email}) - Role: ${p.role}, Dept: ${dept ? `${dept.name} (${dept.code})` : 'NONE'}`);
  });
}

checkAllProfiles();
