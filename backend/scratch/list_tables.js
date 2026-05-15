require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function listTables() {
  const { data, error } = await supabase.from('student_profiles').select('*').limit(1);
  if (error) console.error('Error selecting from student_profiles:', error.message);
  
  // Try to find where staff are stored
  const { data: staff, error: staffError } = await supabase.from('staff_profiles').select('*').limit(1);
  if (staffError) {
    console.error('Error selecting from staff_profiles:', staffError.message);
  } else {
    console.log('Found staff_profiles table.');
  }

  const { data: users, error: usersError } = await supabase.from('profiles').select('*').limit(1);
  if (usersError) {
    console.error('Error selecting from profiles:', usersError.message);
  } else {
    console.log('Found profiles table.');
  }
}

listTables();
