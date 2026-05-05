import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkHOD() {
  const email = 'hod.cs@university.edu.pk'; // From the screenshot earlier
  console.log(`Checking HOD: ${email}`);
  
  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) {
    console.log('HOD not found');
    return;
  }

  console.log('HOD Profile:', {
    email: user.email,
    role: user.role,
    department_id: user.department_id
  });
}

checkHOD();
