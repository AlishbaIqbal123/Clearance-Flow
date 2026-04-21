require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testProfileQuery() {
  const deptId = '7b0a710a-3092-2709-9d4b-b79a91339340';
  console.log('Testing staff-only join for Dept ID:', deptId);

  const { data, error } = await supabase
    .from('departments')
    .select(`
      *,
      staff:profiles(first_name, last_name, email, phone, role)
    `)
    .eq('id', deptId)
    .single();

  if (error) {
    console.error('Query failed:', error);
  } else {
    console.log('Query succeeded:', JSON.stringify(data, null, 2));
  }
}

testProfileQuery();
