const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function testLogin() {
  const email = 'admin@university.edu.pk';
  const password = 'admin123';

  console.log(`Testing login for ${email}...`);

  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !user) {
    console.error('User not found or error:', error);
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch);
  
  if (isMatch) {
    console.log('Login logic successful!');
  } else {
    console.log('Login logic failed: Password mismatch.');
  }
  process.exit(0);
}

testLogin();
