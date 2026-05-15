require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function searchDoneProtocol() {
  const { data: requests, error } = await supabase
    .from('clearance_requests')
    .select('request_id, comments');
  
  if (error) {
    console.error(error);
    return;
  }
  
  requests.forEach(r => {
    const matchingComments = (r.comments || []).filter(c => 
        c.message.toUpperCase().includes('DONE') || 
        c.message.toUpperCase().includes('PROTOCOL')
    );
    if (matchingComments.length > 0) {
        console.log(`Request ${r.request_id} has matching comments:`);
        matchingComments.forEach(c => {
            console.log(`  - [${c.created_at}] ${c.authorName} (${c.department_id}): "${c.message}"`);
        });
    }
  });
}

searchDoneProtocol();
