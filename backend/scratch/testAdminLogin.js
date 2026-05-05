const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Attempting admin login to local backend...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@university.edu.pk',
      password: 'admin123'
    });
    console.log('Login Result:', response.data.success ? 'SUCCESS' : 'FAILED');
    if (response.data.success) {
      console.log('User Role:', response.data.user.role);
    }
  } catch (error) {
    console.error('Login Failed:', error.response?.data?.message || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('ERROR: The backend server is NOT running on port 5000.');
    }
  }
}

testAdminLogin();
