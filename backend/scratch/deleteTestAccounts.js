require('dotenv').config({ path: '.env' });
const supabase = require('../config/supabase');

async function deleteTestAccounts() {
  const { data, error } = await supabase
    .from('profiles')
    .delete()
    .or("email.ilike.%@test.com,first_name.eq.Test,last_name.eq.Exam")
    .select();

  if (error) {
    console.error("Error deleting test accounts:", error);
  } else {
    console.log(`Deleted ${data?.length || 0} test accounts:`);
    data?.forEach(d => console.log(`- ${d.email} (${d.role})`));
  }
}

deleteTestAccounts();
