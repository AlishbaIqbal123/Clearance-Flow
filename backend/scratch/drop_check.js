const supabase = require('../config/supabase');
async function run() {
  const { error } = await supabase.rpc('execute_sql', { sql_query: "ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_type_check;" });
  if (error) {
    console.log("No execute_sql rpc available", error.message);
  } else {
    console.log("Success");
  }
}
run();
