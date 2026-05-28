const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function listAll() {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('registration_number, email, first_name, last_name');
  if (error) {
    console.error(error);
  } else {
    console.log('Registered students:');
    console.table(data);
  }
  process.exit(0);
}
listAll();
