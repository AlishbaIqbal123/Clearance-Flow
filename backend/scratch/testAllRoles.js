require('dotenv').config({ path: '.env' });
const supabase = require('../config/supabase');

async function getConstraints() {
  // Supabase Rest API doesn't expose information_schema directly.
  // I will just test all possible standard roles.
  const rolesToTest = ['admin', 'student', 'hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer', 'hostel_officer', 'staff'];
  for (const role of rolesToTest) {
    const { error } = await supabase.from('profiles').insert({
      first_name: 'Test', last_name: role, email: `${role}@test.com`, role: role
    });
    console.log(`Role '${role}':`, error ? error.message : 'SUCCESS');
  }
}
getConstraints();
