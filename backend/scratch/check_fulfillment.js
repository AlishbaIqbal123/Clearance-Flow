require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkFulfillment(requestId) {
  const { data, error } = await supabase
    .from('clearance_requests')
    .select('degree_fulfillment')
    .eq('request_id', requestId)
    .single();
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Fulfillment for ${requestId}:`, JSON.stringify(data.degree_fulfillment, null, 2));
}

checkFulfillment('CLR-FA23-BSE-002');
