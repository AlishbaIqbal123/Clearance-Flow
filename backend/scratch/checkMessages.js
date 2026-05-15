const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkMessages() {
  const { data, error } = await supabase
    .from('clearance_requests')
    .select('id, comments, student_id')
    .limit(5);

  if (error) {
    console.error('Error fetching requests:', error);
    return;
  }

  data.forEach(req => {
    console.log(`Request ID: ${req.id}`);
    const comments = req.comments || [];
    console.log(`Total comments: ${comments.length}`);
    comments.slice(-3).forEach(c => {
      console.log(`- Author: ${c.author_model}, DeptID: ${c.department_id}, Msg: ${c.message.substring(0, 30)}...`);
    });
    console.log('---');
  });

  // Also check departments
  const { data: depts } = await supabase.from('departments').select('id, name');
  console.log('Departments:', depts.map(d => `${d.name} (${d.id})`));
}

checkMessages();
