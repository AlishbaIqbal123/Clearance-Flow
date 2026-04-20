const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('Inspecting clearance_requests table...');
  const { data, error } = await supabase
    .from('clearance_requests')
    .select('*')
    .limit(1);

  if (error) {
    if (error.message.includes('column')) {
       console.log('Error likely due to missing column:', error.message);
    } else {
       console.error('Error fetching from clearance_requests:', error.message);
    }
  } else {
    console.log('Successfully fetched sample row. Columns present:');
    if (data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log('Table is empty. Cannot determine columns this way.');
    }
  }

  // Try a manual RPC or just a direct query to information_schema if possible
  const { data: cols, error: cErr } = await supabase
    .rpc('get_table_columns', { table_name: 'clearance_requests' });
  
  if (cErr) {
    console.log('RPC get_table_columns not available. Trying brute force select...');
    const { data: bruteData } = await supabase.from('clearance_requests').select('status, student_id').limit(1);
    if (bruteData) console.log('Columns status and student_id exist.');
  } else {
    console.log('Columns:', cols);
  }
}

checkSchema();
