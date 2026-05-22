const http = require('http');

const loginData = JSON.stringify({
  email: 'admin@university.edu.pk',
  password: 'Admin@123'
});

const reqLogin = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`Login failed with status ${res.statusCode}: ${body}`);
      return;
    }
    const { token } = JSON.parse(body);
    console.log('Login successful. Token acquired.');

    // Fetch overview
    const reqOverview = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/overview',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (resOverview) => {
      let overBody = '';
      resOverview.on('data', (chunk) => overBody += chunk);
      resOverview.on('end', () => {
        console.log(`STATUS OVERVIEW: ${resOverview.statusCode}`);
        console.log(`BODY OVERVIEW: ${overBody}`);
      });
    });
    reqOverview.on('error', (e) => console.error('Overview error:', e));
    reqOverview.end();
  });
});

reqLogin.on('error', (e) => {
  console.error(`Login connection failed. Is the server running? ${e.message}`);
});
reqLogin.write(loginData);
reqLogin.end();
