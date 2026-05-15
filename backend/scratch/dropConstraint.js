const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_schema_info', { table_name: 'departments' }).select();
  if (error) {
    console.error("Error calling RPC:", error.message);
  } else {
    console.log(data);
  }
}

async function dropConstraint() {
  const { error } = await supabase.rpc('execute_sql', { 
    sql_query: "ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_type_check;"
  });
  if (error) {
    console.error("Error executing SQL:", error.message);
  } else {
    console.log("Constraint dropped successfully.");
  }
}

dropConstraint();
