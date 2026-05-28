async function runLocalSignup() {
  const payload = {
    registrationNumber: 'FA21-BCS-999',
    firstName: 'Test',
    lastName: 'Student',
    email: 'test_student_999@university.edu.pk',
    password: 'password123',
    departmentId: '9b2c930c-5204-4921-bf6d-d9bc1355a560',
    program: 'Undergraduate Programs (BS)',
    discipline: 'BS Computer Science',
    batch: 'FA21',
    phone: '+923001234567'
  };

  try {
    const res = await fetch('http://localhost:5000/api/auth/student/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const status = res.status;
    const body = await res.json();
    console.log('Signup Result!');
    console.log('Status:', status);
    console.log('Body:', body);
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

runLocalSignup();
