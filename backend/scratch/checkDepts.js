require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDepts() {
  const { data, error } = await supabase.from('departments').select('*').limit(1);
  if (data) {
     console.log('Columns:', Object.keys(data[0]));
     console.log('Sample Data:', data[0]);
  } else {
     console.error(error);
  }
}

checkDepts();
