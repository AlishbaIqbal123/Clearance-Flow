const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function run() {
  try {
    const { data: requests, error: reqErr } = await supabase
      .from('clearance_requests')
      .select('timeline')
      .eq('request_id', 'CLR-FA20-BCS-021');
    if (reqErr) throw reqErr;
    console.log('Timeline:', JSON.stringify(requests[0].timeline, null, 2));
  } catch (err) {
    console.error('Error running script:', err);
  }
}

run();
