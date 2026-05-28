async function testBadPayloads() {
  const basePayload = {
    registrationNumber: 'FA21-BCS-888',
    firstName: 'Test',
    lastName: 'Student',
    email: 'test_student_888@university.edu.pk',
    password: 'password123',
    departmentId: '9b2c930c-5204-4921-bf6d-d9bc1355a560',
    program: 'Undergraduate Programs (BS)',
    discipline: 'BS Computer Science',
    batch: 'FA21',
    phone: '+923001234567'
  };

  const tests = [
    {
      name: 'Missing Phone Number',
      payload: { ...basePayload, phone: '' }
    },
    {
      name: 'Short Password',
      payload: { ...basePayload, password: 'short' }
    },
    {
      name: 'Empty Batch (Regex failure)',
      payload: { ...basePayload, batch: '' }
    },
    {
      name: 'Invalid Email Format',
      payload: { ...basePayload, email: 'notanemail' }
    }
  ];

  for (const t of tests) {
    console.log(`--- Testing: ${t.name} ---`);
    try {
      const res = await fetch('https://clearance-flow.vercel.app/api/auth/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t.payload)
      });
      const status = res.status;
      const body = await res.json();
      console.log('Status:', status);
      console.log('Body:', JSON.stringify(body, null, 2));
    } catch (error) {
      console.error('Fetch error:', error.message);
    }
    console.log();
  }
}

testBadPayloads();
