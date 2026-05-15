require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkUser(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`User ${userId}:`, data.first_name, data.last_name, `(${data.email})`, 'Role:', data.role);
}

checkUser('45b1eede-9fc3-4772-a80d-06a4c9fd4582');
