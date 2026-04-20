require('dotenv').config({ path: 'c:/Users/Hp/Downloads/clearance/university-clearance-system/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkFKs() {
  const { data, error } = await supabase.rpc('get_foreign_keys', { table_name: 'clearance_requests' });
  if (error) {
    // If rpc doesn't exist, I'll try to query information_schema if possible
    // But usually I can't do that via JS client easily without a service role and raw SQL
    console.log('Error fetching FKs via RPC:', error.message);
  } else {
    console.log('clearance_requests FKs:', data);
  }
}

checkFKs();
