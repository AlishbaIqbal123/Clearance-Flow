const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixStudent() {
  const { data: dept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Software Engineering')
    .single();

  if (dept) {
    const { error } = await supabase
      .from('student_profiles')
      .update({ department_id: dept.id })
      .eq('first_name', 'Ali')
      .eq('last_name', 'Ahmad');

    if (error) console.error('Error fixing student:', error);
    else console.log('Fixed Ali Ahmad to Software Engineering department');
    
    // Also delete any existing clearance requests to start fresh for testing
    await supabase.from('clearance_requests').delete().eq('student_id', (await supabase.from('student_profiles').select('id').eq('first_name', 'Ali').single()).data.id);
    console.log('Cleared existing requests for fresh start');
  }
}

fixStudent();
