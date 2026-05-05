const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

async function addDepartments() {
  console.log('🚀 Adding new departments to Supabase...');

  const departments = [
    { 
      id: uuidv4(), 
      name: 'Computer Science', 
      code: 'CS', 
      type: 'academic', 
      is_active: true, 
      description: 'Department of Computer Science',
      clearance_config: { isRequired: true, order: 1 } 
    },
    { 
      id: uuidv4(), 
      name: 'Software Engineering', 
      code: 'SE', 
      type: 'academic', 
      is_active: true, 
      description: 'Department of Software Engineering',
      clearance_config: { isRequired: true, order: 1 } 
    },
    { 
      id: uuidv4(), 
      name: 'Biotechnology', 
      code: 'BIOTECH', 
      type: 'academic', 
      is_active: true, 
      description: 'Department of Biotechnology',
      clearance_config: { isRequired: true, order: 1 } 
    },
    { 
      id: uuidv4(), 
      name: 'Mathematics', 
      code: 'MATH', 
      type: 'academic', 
      is_active: true, 
      description: 'Department of Mathematics',
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

  console.log('\n✨ All departments processed.');
  process.exit();
}

addDepartments();
