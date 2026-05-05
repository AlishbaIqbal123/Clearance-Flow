const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function checkAdmin() {
  console.log('Checking for admin user...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'admin@university.edu.pk')
    .single();

  if (error) {
    console.error('Error fetching admin:', error);
  } else {
    console.log('Admin user found:', {
      id: data.id,
      email: data.email,
      role: data.role,
      status: data.status
    });
  }
  process.exit(0);
}

checkAdmin();
