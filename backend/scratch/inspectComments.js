const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectComments() {
  const { data, error } = await supabase
    .from('clearance_requests')
    .select('id, comments')
    .limit(10);

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(req => {
    if (req.comments && req.comments.length > 0) {
      console.log(`Request ${req.id} has ${req.comments.length} comments.`);
      req.comments.forEach((c, i) => {
        console.log(`  [${i}] author: ${c.author_model}, dept_id: ${c.department_id}, type: ${typeof c.department_id}`);
      });
    }
  });
}

inspectComments();
