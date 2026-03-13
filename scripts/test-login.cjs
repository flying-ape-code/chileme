// 测试登录功能
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 读取 .env.local 文件
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const envLines = envContent.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) {
    acc[key] = value.trim();
  }
  return acc;
}, {});

const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const supabaseAnonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ 无法读取环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  console.log('🧪 测试管理员登录...\n');

  // 先查找 admin 的信息
  console.log('🔍 查找 admin 用户信息...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'admin')
    .single();

  if (profileError) {
    console.log('❌ 查找失败:', profileError.message);
    return;
  }

  console.log('✅ 找到用户:', profile);
  console.log('   用户名:', profile.username);
  console.log('   邮箱:', profile.email);
  console.log('   角色:', profile.role);

  // 尝试用找到的邮箱登录
  console.log('\n🔑 尝试登录...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: '123456'
  });

  if (authError) {
    console.log('❌ 登录失败:', authError.message);
    return;
  }

  console.log('✅ 登录成功!');
  console.log('   用户 ID:', authData.user.id);
  console.log('   邮箱:', authData.user.email);
  console.log('   邮箱确认状态:', authData.user.email_confirmed_at ? '✅ 已确认' : '❌ 未确认');

  console.log('\n✅ Bug #004 修复验证成功！');
}

testAdminLogin();
