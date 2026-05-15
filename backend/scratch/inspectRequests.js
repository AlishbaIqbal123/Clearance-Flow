require('dotenv').config({ path: '.env' });
const supabase = require('../config/supabase');

async function inspect() {
  const { data, error } = await supabase
    .from('clearance_requests')
    .select('id, status, degree_fulfillment, student:student_id(first_name, last_name)');
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log('Total Requests:', data.length);
  console.log('Filtered Requests (status === cleared):', data.filter(r => r.status === 'cleared').length);
  console.log('Requests with degree_fulfillment:', data.filter(r => r.degree_fulfillment).length);
  
  console.log('\nSample Requests:');
  data.slice(0, 10).forEach(r => {
    console.log(`- ${r.student?.first_name} ${r.student?.last_name}: Status=${r.status}, Fulfillment=${JSON.stringify(r.degree_fulfillment)}`);
  });
}

inspect();
