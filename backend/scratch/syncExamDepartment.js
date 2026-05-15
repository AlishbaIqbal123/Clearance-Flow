require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncExam() {
  console.log('Starting Exam Department Sync...');
  
  // 1. Get Exam Department ID
  const { data: examDept, error: deptError } = await supabase
    .from('departments')
    .select('id, clearance_config')
    .ilike('name', '%exam%')
    .single();

  if (deptError || !examDept) {
    console.error('Could not find Exam department:', deptError);
    return;
  }

  const examDeptId = examDept.id;
  console.log(`Found Exam Department ID: ${examDeptId}`);

  // 2. Get all clearance requests
  const { data: requests, error: reqError } = await supabase
    .from('clearance_requests')
    .select('id');

  if (reqError) {
    console.error('Error fetching requests:', reqError);
    return;
  }

  console.log(`Processing ${requests.length} requests...`);

  let addedCount = 0;
  let skippedCount = 0;

  for (const req of requests) {
    // Check if Exam status already exists for this request
    const { data: existing, error: checkError } = await supabase
      .from('clearance_status')
      .select('id')
      .eq('request_id', req.id)
      .eq('department_id', examDeptId)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking status for request ${req.id}:`, checkError);
      continue;
    }

    if (!existing) {
      // Add Exam status
      const { error: insertError } = await supabase
        .from('clearance_status')
        .insert({
          request_id: req.id,
          department_id: examDeptId,
          status: 'pending',
          documents_required: examDept.clearance_config?.requiredDocuments?.map(doc => ({
            name: doc.name,
            submitted: false
          })) || [],
          checklist_items: examDept.clearance_config?.checklist?.map(item => ({
            item: item.item,
            completed: false
          })) || []
        });

      if (insertError) {
        console.error(`Error inserting status for request ${req.id}:`, insertError);
      } else {
        addedCount++;
      }
    } else {
      skippedCount++;
    }
  }

  console.log('Sync Complete!');
  console.log(`Added Exam status to ${addedCount} requests.`);
  console.log(`Skipped ${skippedCount} requests (already had Exam status).`);
}

syncExam();
