const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function listProfiles() {
  console.log('Listing all profiles...');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, is_active');

  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.table(data);
  }
  process.exit(0);
}

listProfiles();
