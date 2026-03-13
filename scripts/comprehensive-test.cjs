// 全面测试认证系统
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 读取 .env.local 文件
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const supabaseAnonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testUser = {
  username: 'testuser' + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: 'test123456'
};

async function cleanupTestUser() {
  console.log('\n🧹 清理测试用户...');
  try {
    // 删除 auth.users 中的用户（需要 service_role）
    // 这里我们只能删除 profile，auth.users 会自动清理或需要管理员手动清理
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('email', testUser.email);

    if (error) {
      console.log('⚠️ 清理失败:', error.message);
    } else {
      console.log('✅ 清理完成');
    }
  } catch (e) {
    console.log('⚠️ 清理时出错:', e.message);
  }
}

async function test1_Register() {
  console.log('\n1️⃣ 测试注册功能');
  console.log('   用户名:', testUser.username);
  console.log('   邮箱:', testUser.email);
  console.log('   密码:', testUser.password);

  const { data, error } = await supabase.auth.signUp({
    email: testUser.email,
    password: testUser.password,
    options: {
      data: {
        username: testUser.username,
        role: 'user'
      }
    }
  });

  if (error) {
    console.log('❌ 注册失败:', error.message);
    return false;
  }

  console.log('✅ 注册成功!');
  console.log('   用户 ID:', data.user.id);

  // 等待触发器创建 profile
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 检查 profile 是否创建
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    console.log('❌ Profile 未创建:', profileError?.message);
    return false;
  }

  console.log('✅ Profile 创建成功!');
  console.log('   用户名:', profile.username);
  console.log('   角色:', profile.role);

  return true;
}

async function test2_LoginWithEmail() {
  console.log('\n2️⃣ 测试邮箱登录');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: testUser.email,
    password: testUser.password
  });

  if (error) {
    console.log('❌ 邮箱登录失败:', error.message);
    return false;
  }

  console.log('✅ 邮箱登录成功!');
  console.log('   用户 ID:', data.user.id);

  return true;
}

async function test3_LoginWithUsername() {
  console.log('\n3️⃣ 测试用户名登录');

  // 先查找用户名对应的邮箱
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('username', testUser.username)
    .single();

  if (profileError || !profile) {
    console.log('❌ 查找用户名失败:', profileError?.message);
    return false;
  }

  console.log('   找到邮箱:', profile.email);

  // 用邮箱登录
  const { data, error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: testUser.password
  });

  if (error) {
    console.log('❌ 用户名登录失败:', error.message);
    return false;
  }

  console.log('✅ 用户名登录成功!');

  return true;
}

async function test4_AdminLogin() {
  console.log('\n4️⃣ 测试管理员登录');

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('username', 'admin')
    .single();

  if (!profile) {
    console.log('❌ 未找到 admin 用户');
    return false;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: '123456'
  });

  if (error) {
    console.log('❌ 管理员登录失败:', error.message);
    return false;
  }

  console.log('✅ 管理员登录成功!');
  console.log('   角色:', profile.role);

  return true;
}

async function test5_WrongPassword() {
  console.log('\n5️⃣ 测试错误密码');

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('username', testUser.username)
    .single();

  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: 'wrongpassword'
  });

  if (error) {
    console.log('✅ 错误密码被正确拒绝');
    console.log('   错误信息:', error.message);
    return true;
  }

  console.log('❌ 错误密码未被拒绝');
  return false;
}

async function test6_WrongEmail() {
  console.log('\n6️⃣ 测试错误的邮箱');

  const { error } = await supabase.auth.signInWithPassword({
    email: 'wrong@example.com',
    password: testUser.password
  });

  if (error) {
    console.log('✅ 错误邮箱被正确拒绝');
    console.log('   错误信息:', error.message);
    return true;
  }

  console.log('❌ 错误邮箱未被拒绝');
  return false;
}

async function runTests() {
  console.log('🚀 开始全面测试...\n');
  console.log('=' .repeat(50));

  const results = {
    '注册功能': false,
    '邮箱登录': false,
    '用户名登录': false,
    '管理员登录': false,
    '错误密码验证': false,
    '错误邮箱验证': false
  };

  try {
    results['注册功能'] = await test1_Register();
    results['邮箱登录'] = await test2_LoginWithEmail();
    results['用户名登录'] = await test3_LoginWithUsername();
    results['管理员登录'] = await test4_AdminLogin();
    results['错误密码验证'] = await test5_WrongPassword();
    results['错误邮箱验证'] = await test6_WrongEmail();

    // 清理
    await cleanupTestUser();

  } catch (error) {
    console.log('\n❌ 测试过程中出错:', error.message);
  }

  // 输出结果
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总:\n');

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ 通过' : '❌ 失败';
    console.log(`   ${test}: ${status}`);
  });

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(v => v).length;

  console.log(`\n总计: ${passedTests}/${totalTests} 通过`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查');
  }
}

runTests();
