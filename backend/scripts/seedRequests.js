const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedRequests() {
  console.log('Seeding Demo Clearance Requests...');
  
  // 1. Get Student and Departments
  const { data: students } = await supabase.from('student_profiles').select('id, registration_number');
  const { data: depts } = await supabase.from('departments').select('id, code');
  
  if (!students || !depts || students.length === 0) {
    console.error('No students or departments found. Run supabaseSeed.js first.');
    return;
  }

  const student = students[0];

  // 2. Create a Clearance Request
  const requestId = `CLR-${Date.now()}`;
  const { data: request, error: rError } = await supabase
    .from('clearance_requests')
    .insert([
      {
        student_id: student.id,
        request_id: requestId,
        request_type: 'graduation',
        status: 'pending',
        reason: 'Finished all courses. Requesting final degree clearance.',
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (rError) {
    console.error('Error creating request:', rError.message);
    return;
  }

  console.log(`Created Request: ${requestId}`);

  // 3. Create status entries for each department
  const statusEntries = depts.map(dept => ({
    request_id: request.id,
    department_id: dept.id,
    status: dept.code === 'FIN' ? 'pending' : 'cleared',
    remarks: dept.code === 'FIN' ? 'Awaiting fee verification' : 'Automated check passed',
    due_amount: dept.code === 'FIN' ? 500 : 0
  }));

  const { error: sError } = await supabase.from('clearance_status').insert(statusEntries);
  
  if (sError) console.error('Error seeding status:', sError.message);
  else console.log('Successfully seeded demo clearance status workflow.');

  // 4. Update Student Status
  await supabase.from('student_profiles').update({ clearance_status: 'pending' }).eq('id', student.id);
  await supabase.from('profiles').update({ clearance_status: 'pending' }).eq('id', student.id);

  console.log('Demo workflow seeding complete.');
}

seedRequests();
