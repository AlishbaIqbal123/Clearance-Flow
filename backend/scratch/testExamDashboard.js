require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDashboard() {
  const departmentId = '39d23a58-27cb-4a81-8a01-de4bae6c68dc'; // Exam ID
  
  // 1. Get current department info
  const { data: currentDept } = await supabase
    .from('departments')
    .select('id, type, code, contact_info')
    .eq('id', departmentId)
    .single();
  
  console.log('Current Dept:', currentDept);

  // 2. Get statistics
  const { data: statsRaw } = await supabase
    .from('clearance_status')
    .select('request_id, status')
    .eq('department_id', departmentId);

  console.log('Stats Raw Count:', statsRaw?.length);

  const isExam = currentDept?.code === 'EXD' || currentDept?.contact_info?.custom_type === 'exam';
  const isAcademic = currentDept?.type === 'academic';

  let statsMap = (statsRaw || []).reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  console.log('Stats Map (Initial):', statsMap);

  if ((isAcademic || isExam) && statsRaw?.length > 0) {
    const requestIds = statsRaw.map(s => s.request_id);
    const { data: phase1Data } = await supabase
      .from('clearance_status')
      .select('request_id, status, department_id, department:department_id(id, type, name, code)')
      .in('request_id', requestIds);

    const readyRequestIds = new Set();
    const requestsPhase1Status = (phase1Data || []).reduce((acc, curr) => {
      if (!acc[curr.request_id]) acc[curr.request_id] = [];
      acc[curr.request_id].push(curr);
      return acc;
    }, {});

    Object.keys(requestsPhase1Status).forEach(rid => {
      const statuses = requestsPhase1Status[rid];
      let isReady = false;

      if (isExam) {
        const otherStatuses = statuses.filter(s => s.department_id !== currentDept.id);
        isReady = otherStatuses.length > 0 && otherStatuses.every(s => s.status === 'cleared');
        console.log(`Request ${rid}: Other Statuses Count: ${otherStatuses.length}, Is Ready: ${isReady}`);
      } else if (isAcademic) {
        const phase1Statuses = statuses.filter(s => s.department?.type !== 'academic' && s.department?.code !== 'EXD');
        isReady = phase1Statuses.length > 0 && phase1Statuses.every(s => s.status === 'cleared');
      }

      if (isReady) readyRequestIds.add(rid);
    });

    console.log('Ready Request IDs:', Array.from(readyRequestIds));

    const finalStatsMap = { pending: 0, in_review: 0, cleared: 0, rejected: 0 };
    statsRaw.forEach(s => {
      if (readyRequestIds.has(s.request_id)) {
        finalStatsMap[s.status] = (finalStatsMap[s.status] || 0) + 1;
      }
    });
    console.log('Final Stats Map:', finalStatsMap);
  }
}

testDashboard();
