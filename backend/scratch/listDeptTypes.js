require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

sb.from('departments')
  .select('name, code, type, is_active')
  .then(({ data, error }) => {
    if (error) { console.error(error.message); return; }
    console.log(JSON.stringify(data, null, 2));
  });
