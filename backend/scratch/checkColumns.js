import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
  console.log('Checking departments columns...');
  const { data: deptData, error: deptError } = await supabase.from('departments').select('*').limit(1);
  if (deptData && deptData.length > 0) {
    console.log('Departments columns:', Object.keys(deptData[0]));
  }

  console.log('\nChecking student_profiles columns...');
  const { data: studentData, error: studentError } = await supabase.from('student_profiles').select('*').limit(1);
  if (studentData && studentData.length > 0) {
    console.log('Student_profiles columns:', Object.keys(studentData[0]));
  }
}

checkColumns();
