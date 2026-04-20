const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugLogin() {
  const email = 'admin@university.edu.pk';
  const rawPassword = 'Admin@123';

  console.log(`Debugging login for: ${email}`);

  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('User not found in Supabase:', error.message);
    return;
  }

  console.log('User found. Stored password hash:', user.password);

  const isMatch = await bcrypt.compare(rawPassword, user.password);
  console.log('Does password match manually?', isMatch);

  if (!isMatch) {
    console.log('Re-hashing and re-updating...');
    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(rawPassword, salt);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ password: newHash })
      .eq('email', email);
    
    if (updateError) console.error('Update failed:', updateError.message);
    else console.log('Update successful. Try logging in now.');
  }
}

debugLogin();
