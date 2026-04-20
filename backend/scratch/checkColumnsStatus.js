require('dotenv').config({ path: 'backend/.env' });
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`)
  .then(r => r.json())
  .then(data => {
    const cs = data.definitions.clearance_status.properties;
    console.log('Clearance Status columns:', Object.keys(cs));
  })
  .catch(e => console.error(e));
