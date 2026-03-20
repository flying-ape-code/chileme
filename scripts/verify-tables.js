/**
 * 验证数据库表创建成功
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function verifyTables() {
  console.log('🔍 验证数据库表...');
  
  // 检查 meals 表
  const { data: meals, error: mealsError } = await supabase
    .from('meals')
    .select('*', { count: 'exact', head: true });
  
  if (mealsError) {
    console.error('❌ meals 表不存在:', mealsError.message);
    return false;
  }
  
  console.log('✅ meals 表创建成功！');
  
  // 检查函数
  const { data: functions, error: funcError } = await supabase
    .from('pg_proc')
    .select('proname')
    .eq('proname', 'update_updated_at_column');
  
  if (funcError) {
    console.error('❌ 函数检查失败:', funcError.message);
  } else if (functions && functions.length > 0) {
    console.log('✅ update_updated_at_column 函数存在！');
  } else {
    console.log('⚠️  函数未找到（可能权限不足）');
  }
  
  return true;
}

verifyTables().catch(console.error);
