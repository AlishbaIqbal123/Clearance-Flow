const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function listStudents() {
  console.log('Listing all students...');
  const { data, error } = await supabase
    .from('student_profiles')
    .select('id, registration_number, email, discipline, department_id, department:department_id(name)');

  if (error) {
    console.error('Error fetching students:', error);
  } else {
    console.table(data.map(s => ({
      id: s.id,
      reg: s.registration_number,
      discipline: s.discipline,
      dept_id: s.department_id,
      dept_name: s.department?.name
    })));
  }
  process.exit(0);
}

listStudents();
