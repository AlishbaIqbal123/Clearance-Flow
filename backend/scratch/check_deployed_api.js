async function checkDeployed() {
  try {
    const res = await fetch('https://clearance-flow.vercel.app/api/departments');
    const status = res.status;
    const body = await res.json();
    console.log('Deployed Departments Result!');
    console.log('Status:', status);
    console.log('Body length/success:', body.success, body.data ? body.data.length : 'no data');
    if (body.data) {
      console.log('Sample department:', body.data[0]);
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

checkDeployed();
