require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkProfilesColumns() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
  if (error) {
    console.error(error);
    return;
  }
  console.log('Profile columns:', Object.keys(data));
}

checkProfilesColumns();
