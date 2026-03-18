const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verify() {
  console.log('🔍 验证数据库表创建...\n');
  
  // 检查 feedbacks 表
  const { data: feedbacks } = await supabase
    .from('feedbacks')
    .select('*', { count: 'exact', head: true });
  
  console.log('feedbacks 表:', feedbacks ? '✅ 存在' : '❌ 不存在');
  
  // 检查 feedback_images 表
  const { data: images } = await supabase
    .from('feedback_images')
    .select('*', { count: 'exact', head: true });
  
  console.log('feedback_images 表:', images ? '✅ 存在' : '❌ 不存在');
  
  // 检查 RLS 策略
  const { data: policies } = await supabase
    .from('pg_policies')
    .select('policyname, tablename')
    .in('tablename', ['feedbacks', 'feedback_images']);
  
  console.log('RLS 策略:', policies?.length || 0, '个');
  
  if (feedbacks && images) {
    console.log('\n✅ 数据库表创建成功！');
  } else {
    console.log('\n❌ 表创建失败，请检查 SQL 执行结果');
  }
}

verify().catch(console.error);
