require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, role, department_id, department:department_id(name, code)')
    .ilike('first_name', '%exam%');
  
  if (error) console.error(error);
  else console.log(JSON.stringify(users, null, 2));
}

checkUser();
