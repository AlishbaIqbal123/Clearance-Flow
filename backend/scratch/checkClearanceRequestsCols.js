const supabase = require('../config/supabase');

async function check() {
  const { data, error } = await supabase.from('clearance_requests').select('*').limit(1);
  if (error) {
    console.error('Error fetching clearance_requests:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Clearance Requests Columns:', Object.keys(data[0]));
  } else {
    // If empty, use rpc or just try to select something
    console.log('Table is empty, trying to get schema via rpc or something?');
  }
}

check();
