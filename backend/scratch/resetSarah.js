require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function resetSarah() {
  const email = 'finance.officer@university.edu.pk';
  const password = 'official123';
  const hashedPassword = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      password: hashedPassword,
      is_first_login: true 
    })
    .eq('email', email);

  if (error) {
    console.error('Update failed:', error);
  } else {
    console.log('Sarah Ahmed password reset to: official123');
  }
}

resetSarah();
