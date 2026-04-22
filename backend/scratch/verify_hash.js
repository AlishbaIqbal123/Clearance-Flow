const bcrypt = require('bcryptjs');

const hash = '$2a$12$gE7uwCyCalgK5UYB3uTv3.v8jz3r0Nl8GcCTYMAR7ELdiBkkSyOBO';
const passwords = ['password123', 'student123', '12345678', 'password'];

passwords.forEach(pw => {
  const match = bcrypt.compareSync(pw, hash);
  console.log(`Password "${pw}" match: ${match}`);
});
