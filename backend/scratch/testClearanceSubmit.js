require('dotenv').config({ path: 'c:/Users/Hp/Downloads/clearance/university-clearance-system/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSubmit() {
  const studentId = '8bace764-cb27-4993-a8d2-faaf46f4e8c7'; // Ali Ahmad
  
  // 1. Get departments
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .eq('is_active', true);
  
  console.log('Departments found:', departments.length);

  // 2. Create request
  const requestId = `TEST-CLR-${Date.now()}`;
  const { data: request, error: requestError } = await supabase
    .from('clearance_requests')
    .insert({
      student_id: studentId,
      request_id: requestId,
      request_type: 'graduation',
      reason: 'Testing submission issue',
      status: 'submitted',
      progress: {
        totalDepartments: departments.length,
        clearedDepartments: 0,
        pendingDepartments: departments.length,
        percentage: 0
      }
    })
    .select()
    .single();

  if (requestError) {
    console.error('Request insert error:', requestError.message);
    console.error('Error detail:', requestError);
    return;
  }
  
  console.log('Request created successfully. ID:', request.id);

  // 3. Create status entries
  const statusEntries = departments.map(dept => ({
    request_id: request.id,
    department_id: dept.id,
    status: 'pending'
  }));

  const { error: statusError } = await supabase
    .from('clearance_status')
    .insert(statusEntries);

  if (statusError) {
    console.error('Status insert error:', statusError.message);
    console.error('Error detail:', statusError);
  } else {
    console.log('Status entries created successfully!');
  }
}

testSubmit();
