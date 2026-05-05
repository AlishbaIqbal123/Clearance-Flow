const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  const newPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  console.log(`Resetting password for admin@university.edu.pk to: ${newPassword}`);
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      password: hashedPassword,
      is_active: true // Ensure they are active
    })
    .eq('email', 'admin@university.edu.pk');

  if (error) {
    console.error('Error resetting password:', error);
  } else {
    console.log('Password reset successfully!');
  }
  process.exit(0);
}

resetAdminPassword();
