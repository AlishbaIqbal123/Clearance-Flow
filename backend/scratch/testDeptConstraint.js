require('dotenv').config({ path: '.env' });
const supabase = require('../config/supabase');

async function testDept() {
  const { data, error } = await supabase
    .from('departments')
    .delete()
    .eq('id', '1f95a4df-4f25-48dc-9b03-f52771f51ced');

  console.log("Delete result:", { error });
}
testDept();
