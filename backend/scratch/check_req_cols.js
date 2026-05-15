require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkRequestCols() {
  const { data, error } = await supabase.from('clearance_requests').select('*').limit(1).single();
  if (error) {
    console.error(error);
    return;
  }
  console.log('Request columns:', Object.keys(data));
}

checkRequestCols();
