const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Checking database counts...');
  
  const tables = ['profiles', 'student_profiles', 'departments', 'clearance_requests', 'clearance_status'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`Error checking ${table}:`, error.message);
      } else {
        console.log(`${table}: ${count} records`);
      }
    } catch (e) {
      console.error(`Exception checking ${table}:`, e.message);
    }
  }

  // Check for active students specifically
  try {
    const { count: activeStudents } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    console.log(`Active students: ${activeStudents}`);
  } catch (e) {}

  // Check for some sample data
  try {
    const { data: sampleStudents } = await supabase
      .from('student_profiles')
      .select('first_name, last_name, registration_number, is_active')
      .limit(5);
    console.log('Sample students:', JSON.stringify(sampleStudents, null, 2));
  } catch (e) {}
}

checkDatabase();
