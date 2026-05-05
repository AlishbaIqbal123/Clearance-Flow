import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugFilter() {
  const departmentId = '9b2c930c-5204-4921-bf6d-d9bc1355a560'; // Computer Science
  const studentReg = 'FA20-BCS-001'; // Ali Ahmad
  
  console.log('--- Debugging Sequential Flow Filter ---');
  
  // 1. Get student request
  const { data: student } = await supabase.from('student_profiles').select('id').eq('registration_number', studentReg).single();
  const { data: request } = await supabase.from('clearance_requests').select('*').eq('student_id', student.id).single();
  
  const records = [request];
  const requestIds = [request.id];
  
  // 2. Fetch statuses exactly as the backend does
  console.log('Fetching all statuses for request:', request.id);
  const { data: allStatuses, error: statusError } = await supabase
    .from('clearance_status')
    .select('request_id, status, department:department_id(type, name)')
    .in('request_id', requestIds);

  if (statusError) {
    console.error('Status Fetch Error:', statusError);
    return;
  }

  console.log(`Found ${allStatuses.length} status records for the request.`);
  
  const statuses = allStatuses.filter(s => s.request_id === request.id);
  const phase1Statuses = statuses.filter(s => s.department?.type !== 'academic');
  
  console.log('Phase 1 Statuses:');
  phase1Statuses.forEach(s => {
    console.log(`- ${s.department?.name}: ${s.status} (Type: ${s.department?.type})`);
  });

  const isPhase1Complete = phase1Statuses.every(s => s.status === 'cleared');
  console.log('Is Phase 1 Complete?', isPhase1Complete);
  
  if (isPhase1Complete) {
    console.log('RESULT: Request should be VISIBLE to Academic Head');
  } else {
    console.log('RESULT: Request should be HIDDEN from Academic Head');
  }
}

debugFilter();
