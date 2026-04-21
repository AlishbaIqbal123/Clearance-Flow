const supabase = require('../config/supabase');

async function clearDB() {
  console.log('Clearing database for fresh start...');
  
  // Order matters due to FKs
  const tables = ['clearance_status', 'clearance_requests', 'student_profiles', 'profiles', 'departments'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error(`Error clearing ${table}:`, error.message);
    } else {
      console.log(`✅ Cleared ${table}`);
    }
  }
  process.exit();
}

clearDB();
