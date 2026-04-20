require('dotenv').config();
const supabase = require('../config/supabase');

async function checkSchema() {
  console.log('Checking student_profiles columns...');
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching student_profiles:', error.message);
  } else if (data && data.length > 0) {
    console.log('Columns in student_profiles:', Object.keys(data[0]));
  } else {
    console.log('No data found in student_profiles to determine columns.');
  }

  console.log('\nChecking profiles columns...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (profileError) {
    console.error('Error fetching profiles:', profileError.message);
  } else if (profileData && profileData.length > 0) {
    console.log('Columns in profiles:', Object.keys(profileData[0]));
  } else {
    console.log('No data found in profiles to determine columns.');
  }
}

checkSchema();
