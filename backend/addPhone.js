const fs = require('fs');
let content = fs.readFileSync('./scripts/seedSupabase.js', 'utf8');
content = content.replace(/first_name:\s*'([^']+)',/g, "phone: '+923001234567',\n        first_name: '$1',");
fs.writeFileSync('./scripts/seedSupabase.js', content);
console.log('Added phone numbers!');
