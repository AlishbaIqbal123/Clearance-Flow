const testEndpoints = async () => {
  try {
    console.log('Testing /health endpoint...');
    const healthRes = await fetch('http://localhost:5000/health');
    const healthData = await healthRes.json();
    console.log('/health status:', healthRes.status);
    console.log('/health response:', healthData);

    console.log('\nTesting /api/debug/test-db endpoint...');
    const dbRes = await fetch('http://localhost:5000/api/debug/test-db');
    const dbData = await dbRes.json();
    console.log('/api/debug/test-db status:', dbRes.status);
    console.log('/api/debug/test-db response:', dbData);
  } catch (err) {
    console.error('Error during test:', err);
  }
};

testEndpoints();
