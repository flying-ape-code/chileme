/**
 * 测试管理员账号
 * 使用方法：node scripts/test-admin-login.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 读取 .env.local 文件
const envPath = path.join(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.error('❌ 读取 .env.local 文件失败:', error.message);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminLogin() {
  console.log('\n🔍 测试管理员账号登录\n');

  const username = 'admin';
  const email = 'admin@chileme.com';
  const password = '123456';

  try {
    // 1. 先检查 profiles 表中是否有管理员
    console.log('1️⃣ 检查 profiles 表...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (profileError) {
      console.log('   ❌ 查询失败:', profileError.message);
    } else {
      console.log('   ✅ 找到管理员 profile:');
      console.log('   ', JSON.stringify(profileData, null, 2));
    }

    // 2. 尝试用邮箱登录
    console.log('\n2️⃣ 尝试用邮箱登录...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log('   ❌ 登录失败:', authError.message);
      console.log('   错误代码:', authError.status);
    } else {
      console.log('   ✅ 登录成功!');
      console.log('   用户 ID:', authData.user.id);
      console.log('   Email:', authData.user.email);

      // 3. 获取完整的 profile 信息
      console.log('\n3️⃣ 获取完整 profile...');
      const { data: fullProfileData, error: fullProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (fullProfileError) {
        console.log('   ❌ 获取 profile 失败:', fullProfileError.message);
      } else {
        console.log('   ✅ Profile 信息:');
        console.log('   ', JSON.stringify(fullProfileData, null, 2));
      }
    }
  } catch (error) {
    console.error('❌ 发生错误:', error.message);
  }
}

testAdminLogin();
