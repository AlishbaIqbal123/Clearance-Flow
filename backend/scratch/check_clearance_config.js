require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkClearanceConfig() {
  const { data, error } = await supabase.from('departments').select('id, name, clearance_config').limit(5);
  if (error) {
    console.error(error);
  } else {
    data.forEach(d => {
      console.log(`Dept: ${d.name}`);
      console.log('Config:', JSON.stringify(d.clearance_config, null, 2));
    });
  }
}

checkClearanceConfig();
