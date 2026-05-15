const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function testQuery() {
  const table = 'student_profiles';
  const registrationNumber = 'FA23-BSE-002';
  
  let query = supabase.from(table).select('id, first_name, email, role');
  query = query.eq('registration_number', registrationNumber.toUpperCase());

  const { data: user, error } = await query.single();
  
  console.log('Result user:', user);
  console.log('Result error:', error);
}

testQuery();
