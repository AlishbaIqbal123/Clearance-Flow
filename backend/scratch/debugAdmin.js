const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function debugAdmin() {
  const email = 'admin@university.edu.pk';
  console.log(`Debugging profile for ${email}...`);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Profile Data:', JSON.stringify(data, null, 2));
  }
  process.exit(0);
}

debugAdmin();
