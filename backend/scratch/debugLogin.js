import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('MISSING CREDENTIALS in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogin() {
  const email = 'admin@university.edu.pk';
  console.log(`Checking user: ${email}`);
  
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('DB Error:', error.message);
    return;
  }

  if (!user) {
    console.log('User not found in profiles table');
    return;
  }

  console.log('User found:', {
    id: user.id,
    email: user.email,
    role: user.role,
    is_active: user.is_active
  });

  // Since we don't know the raw password from the user's side in this script, 
  // we can't test matches here without the raw password.
  // But we can verify if the bcrypt hash looks valid.
  console.log('Password Hash in DB:', user.password);
}

checkLogin();
