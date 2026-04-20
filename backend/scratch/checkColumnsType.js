require('dotenv').config({ path: 'backend/.env' });
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`)
  .then(r => r.json())
  .then(data => {
    const cr = data.definitions.clearance_requests.properties;
    console.log('Clearance Requests Progress Column:', cr.progress);
  })
  .catch(e => console.error(e));
