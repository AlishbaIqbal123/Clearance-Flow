require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExam() {
  const { data, error } = await supabase.from('departments').select('*').ilike('name', '%exam%');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

checkExam();
