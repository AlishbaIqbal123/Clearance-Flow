require('dotenv').config({ path: '.env' });
const supabase = require('../config/supabase');

async function testRole() {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      first_name: 'Test',
      last_name: 'Exam',
      email: 'exam1234@test.com',
      role: 'department_officer'
    })
    .select();

  console.log("Insert result:", { error: error?.message });
}
testRole();
