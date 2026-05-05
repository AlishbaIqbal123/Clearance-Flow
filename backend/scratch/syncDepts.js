const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function syncDepartments() {
  console.log('Syncing departments according to new academic structure...');

  // 1. Delete departments that should be disciplines
  const toDelete = ['Software Engineering', 'Biotechnology', 'Agriculture'];
  const { error: deleteError } = await supabase
    .from('departments')
    .delete()
    .in('name', toDelete);

  if (deleteError) console.log('Note: Some departments could not be deleted (likely because of existing records).');

  // 2. Add Economics department
  const { error: addError } = await supabase
    .from('departments')
    .upsert([
      { name: 'Economics', code: 'ECON', type: 'academic' }
    ], { onConflict: 'name' });

  if (addError) console.error('Error adding Economics:', addError);

  // 3. Ensure other departments exist and are typed correctly
  const academicDepts = [
    { name: 'Computer Science', code: 'CS', type: 'academic' },
    { name: 'Management Sciences', code: 'MS', type: 'academic' },
    { name: 'Environmental Sciences', code: 'ES', type: 'academic' },
    { name: 'Humanities', code: 'HUM', type: 'academic' },
    { name: 'Mathematics', code: 'MATH', type: 'academic' }
  ];

  const { error: upsertError } = await supabase
    .from('departments')
    .upsert(academicDepts, { onConflict: 'name' });

  if (upsertError) console.error('Error upserting academic departments:', upsertError);

  console.log('Department sync complete.');
  process.exit(0);
}

syncDepartments();
