const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function listDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('*');

  if (error) {
    console.error('Error fetching departments:', error);
    process.exit(1);
  }

  console.log('--- Departments in Database ---');
  data.forEach(d => {
    console.log(`- ID: ${d.id}, Name: "${d.name}", Code: "${d.code}", Type: "${d.type}"`);
  });
  process.exit(0);
}

listDepartments();
