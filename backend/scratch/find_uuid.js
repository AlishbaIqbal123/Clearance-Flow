require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function findRequestUuid(requestId) {
  const { data, error } = await supabase
    .from('clearance_requests')
    .select('id, request_id')
    .eq('request_id', requestId)
    .single();
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Request ID ${requestId} has UUID ${data.id}`);
}

findRequestUuid('CLR-FA23-BSE-002');
