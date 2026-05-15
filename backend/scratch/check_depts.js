require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkDepts() {
  const { data, error } = await supabase
    .from('departments')
    .select('id, name, code');
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log('Departments:', data);
}

checkDepts();
