require('dotenv').config({ path: '.env' });
const supabase = require('../config/supabase');

async function checkSchema() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  console.log("Profiles columns:", Object.keys(data[0] || {}));
}
checkSchema();
