require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function probeClearanceStatus() {
  const { data, error } = await supabase.from('clearance_status').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log('Columns in clearance_status:', Object.keys(data[0] || {}));
  }
}

probeClearanceStatus();
