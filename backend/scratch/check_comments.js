require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkAllExamComments() {
  const { data: requests, error } = await supabase
    .from('clearance_requests')
    .select('request_id, comments');
  
  if (error) {
    console.error(error);
    return;
  }
  
  const examDeptId = '39d23a58-27cb-4a81-8a01-de4bae6c68dc';
  
  requests.forEach(r => {
    const examComments = (r.comments || []).filter(c => c.department_id === examDeptId);
    if (examComments.length > 0) {
        console.log(`Request ${r.request_id} has ${examComments.length} exam comments:`);
        examComments.forEach(c => {
            console.log(`  - [${c.created_at}] ${c.authorName}: "${c.message}"`);
        });
    }
  });
}

checkAllExamComments();
