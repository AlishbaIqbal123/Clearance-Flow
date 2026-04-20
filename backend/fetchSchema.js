require('dotenv').config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`)
  .then(r => r.json())
  .then(data => {
    const p = data.definitions.profiles.properties;
    console.log('Profiles columns:', Object.keys(p));
    const s = data.definitions.student_profiles.properties;
    console.log('Students columns:', Object.keys(s));
  })
  .catch(e => console.error(e));
