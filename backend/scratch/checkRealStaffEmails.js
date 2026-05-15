const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkEmails() {
  console.log('Checking profiles for registered emails...');
  const { data: staff, error } = await supabase
    .from('profiles')
    .select('id, first_name, email, role')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching staff:', error);
    return;
  }

  if (!staff || staff.length === 0) {
    console.log('No staff found in the database.');
    return;
  }

  console.table(staff);
}

checkEmails();
