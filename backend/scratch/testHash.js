import bcrypt from 'bcryptjs';

async function test() {
  const hash = '$2a$10$Tx7.5cUV/rIQicBXrBaWBOewC83H2V3n3D9XiLJ57Ean31hGx1whm';
  const passwords = ['admin123', 'admin', 'password', '12345678', 'Admin123', 'Admin@123', 'admin@123'];
  
  for (const p of passwords) {
    const match = await bcrypt.compare(p, hash);
    console.log(`Password "${p}": ${match ? 'MATCH' : 'NO MATCH'}`);
  }
}

test();
