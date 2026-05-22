require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function probeDepartments() {
  const { data, error } = await supabase.from('departments').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log('Columns in departments:', Object.keys(data[0] || {}));
  }
}

probeDepartments();
