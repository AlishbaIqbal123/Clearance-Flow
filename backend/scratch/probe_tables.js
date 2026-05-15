require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function listAllTables() {
  const { data, error } = await supabase.rpc('get_tables'); // Custom RPC if it exists, but let's try direct select from common tables
  
  const tables = ['degree_allotments', 'exam_protocols', 'clearance_requests', 'student_profiles', 'departments'];
  
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (!error) {
      console.log(`Table '${t}' exists.`);
    }
  }
}

listAllTables();
