import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://xukvylztdjexjngowmyh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('clearance_statuses').select('*').limit(1);
  if (error) console.error("Error with clearance_statuses:", error);
  else console.log("Success with clearance_statuses");
  
  const { data: data2, error: error2 } = await supabase.from('clearance_status').select('*').limit(1);
  if (error2) console.error("Error with clearance_status:", error2);
  else console.log("Success with clearance_status");
}
check();
