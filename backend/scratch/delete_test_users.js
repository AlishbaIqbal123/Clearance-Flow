const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');

async function deleteTestUsers() {
  const regNumbers = ['FA21-BCS-999', 'FA21-BCS-777'];
  
  console.log('Fetching test students...');
  const { data: students, error: fetchError } = await supabase
    .from('student_profiles')
    .select('id, registration_number')
    .in('registration_number', regNumbers);

  if (fetchError) {
    console.error('Error fetching test students:', fetchError);
    process.exit(1);
  }

  if (!students || students.length === 0) {
    console.log('No test students found to delete.');
    process.exit(0);
  }

  const studentIds = students.map(s => s.id);
  console.log(`Found test students with IDs:`, studentIds);

  // 1. Delete from clearance_status
  console.log('Deleting from clearance_status...');
  const { error: statusError } = await supabase
    .from('clearance_status')
    .delete()
    .in('student_id', studentIds);
  if (statusError) {
    console.error('Error deleting clearance_status:', statusError.message);
  }

  // 2. Delete from clearance_requests
  console.log('Deleting from clearance_requests...');
  const { error: requestError } = await supabase
    .from('clearance_requests')
    .delete()
    .in('student_id', studentIds);
  if (requestError) {
    console.error('Error deleting clearance_requests:', requestError.message);
  }

  // 3. Delete from student_profiles
  console.log('Deleting from student_profiles...');
  const { error: profileError } = await supabase
    .from('student_profiles')
    .delete()
    .in('id', studentIds);
  if (profileError) {
    console.error('Error deleting student_profiles:', profileError.message);
  } else {
    console.log('Successfully deleted test students!');
  }

  process.exit(0);
}

deleteTestUsers();
