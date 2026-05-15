const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, department_id');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  data.forEach(u => {
    if (u.role === 'staff' || u.role === 'admin') {
      console.log(`User: ${u.full_name} (${u.email}), Role: ${u.role}, DeptID: ${u.department_id}`);
    }
  });
}

checkUsers();
