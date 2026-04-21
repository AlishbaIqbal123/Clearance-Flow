require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedContacts() {
  console.log('Seeding department contact info and office hours...');
  
  // 1. Get all departments
  const { data: depts } = await supabase.from('departments').select('id, name, head_id');
  
  // 2. Get head emails
  const headIds = depts.map(d => d.head_id).filter(Boolean);
  const { data: heads } = await supabase.from('profiles').select('id, email').in('id', headIds);
  
  for (const dept of depts) {
    const head = heads.find(h => h.id === dept.head_id);
    const email = head?.email || `${dept.name.toLowerCase().replace(/\s+/g, '.')}@university.edu.pk`;
    
    const contactInfo = {
      email: email,
      whatsapp_number: '+923000000000',
      contact_preference: 'university'
    };
    
    if (dept.name.includes('Finance')) {
      contactInfo.whatsapp_number = '+923123456789';
    } else if (dept.name.includes('Software')) {
      contactInfo.whatsapp_number = '+923987654321';
    }

    const { error } = await supabase
      .from('departments')
      .update({ 
        contact_info: contactInfo,
        location: 'Admin Block, Ground Floor',
        office_hours: 'Monday - Friday, 09:00 AM - 04:30 PM'
      })
      .eq('id', dept.id);
    
    if (error) console.error(`Error updating ${dept.name}:`, error.message);
    else console.log(`Updated ${dept.name} with email ${email}`);
  }
}

seedContacts();
