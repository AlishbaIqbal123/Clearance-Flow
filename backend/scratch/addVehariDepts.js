const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

async function addVehariDepartments() {
  console.log('🚀 Adding Vehari-specific departments to Supabase...');

  const departments = [
    { 
      id: uuidv4(), 
      name: 'Management Sciences', 
      code: 'MS', 
      type: 'academic', 
      is_active: true, 
      description: 'Department of Management Sciences',
      clearance_config: { isRequired: true, order: 1 } 
    },
    { 
      id: uuidv4(), 
      name: 'Humanities', 
      code: 'HUM', 
      type: 'academic', 
      is_active: true, 
      description: 'Department of Humanities',
      clearance_config: { isRequired: true, order: 1 } 
    },
    { 
      id: uuidv4(), 
      name: 'Environmental Sciences', 
      code: 'ES', 
      type: 'academic', 
      is_active: true, 
      description: 'Department of Environmental Sciences',
      clearance_config: { isRequired: true, order: 1 } 
    },
    { 
      id: uuidv4(), 
      name: 'Agriculture', 
      code: 'AG', 
      type: 'academic', 
      is_active: true, 
      description: 'Department of Agriculture',
      clearance_config: { isRequired: true, order: 1 } 
    }
  ];

  for (const dept of departments) {
    // Check if exists by code
    const { data: existing } = await supabase
      .from('departments')
      .select('id')
      .eq('code', dept.code)
      .single();

    if (existing) {
      console.log(`ℹ️ Department ${dept.name} (${dept.code}) already exists. Updating...`);
      const { error } = await supabase
        .from('departments')
        .update({
          name: dept.name,
          type: dept.type,
          is_active: true,
          description: dept.description
        })
        .eq('code', dept.code);
      
      if (error) console.error(`❌ Error updating ${dept.name}:`, error.message);
      else console.log(`✅ ${dept.name} updated.`);
    } else {
      console.log(`➕ Adding department ${dept.name} (${dept.code})...`);
      const { error } = await supabase
        .from('departments')
        .insert([dept]);
      
      if (error) console.error(`❌ Error adding ${dept.name}:`, error.message);
      else console.log(`✅ ${dept.name} added.`);
    }
  }

  console.log('\n✨ All Vehari departments processed.');
  process.exit();
}

addVehariDepartments();
