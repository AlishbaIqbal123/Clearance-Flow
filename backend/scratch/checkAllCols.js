require('dotenv').config({ path: 'backend/.env' });

async function check() {
  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    const data = await r.json();
    console.log('Clearance Requests Columns:', Object.keys(data.definitions.clearance_requests.properties));
    console.log('Profiles Columns:', Object.keys(data.definitions.profiles.properties));
    console.log('Student Profiles Columns:', Object.keys(data.definitions.student_profiles.properties));
  } catch (e) {
    console.error(e);
  }
}
check();
