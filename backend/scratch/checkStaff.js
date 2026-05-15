const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStaff() {
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('id, email, first_name, department_id, department:department_id(name)');

  if (error) {
    console.error('Error fetching staff:', error);
    return;
  }

  data.forEach(s => {
    console.log(`Staff: ${s.first_name} (${s.email}), Dept: ${s.department?.name} (${s.department_id})`);
  });
}

checkStaff();
