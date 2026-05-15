require('dotenv').config({ path: './backend/.env' });
const supabase = require('../config/supabase');

async function checkClearanceStatus(requestUuid) {
  const { data, error } = await supabase
    .from('clearance_status')
    .select('*, department:department_id(name, code)')
    .eq('request_id', requestUuid);
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log('Clearance status entries:');
  data.forEach(cs => {
    console.log(`- ${cs.department.name} (${cs.department.code}): ${cs.status} (ID: ${cs.id}, DeptID: ${cs.department_id})`);
  });
}

checkClearanceStatus('d994e839-8dee-484b-841a-302d59add728');
