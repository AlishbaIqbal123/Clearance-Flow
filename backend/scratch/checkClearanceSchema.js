require('dotenv').config({ path: 'c:/Users/Hp/Downloads/clearance/university-clearance-system/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log('Fetching schema from:', process.env.SUPABASE_URL);
  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    const data = await res.json();
    
    if (data && data.definitions) {
      console.log('--- Clearance Requests Columns ---');
      console.log(Object.keys(data.definitions.clearance_requests?.properties || {}).join(', '));
      
      console.log('\n--- Clearance Status Columns ---');
      console.log(Object.keys(data.definitions.clearance_status?.properties || {}).join(', '));
    } else {
      console.log('Definitions not found in response');
      console.log('Response keys:', Object.keys(data));
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

check();
