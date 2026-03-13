/**
 * 创建管理员账号的简化脚本
 * 使用方法：node scripts/create-admin-simple.js
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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误：未找到 Supabase 配置');
  console.error('请确保 .env.local 文件中配置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log('\n🚀 创建管理员账号\n');

  const username = 'admin';
  const email = 'admin@chileme.com';
  const password = '123456';

  console.log('⏳ 正在创建管理员账号...\n');

  try {
    // 1. 在 Supabase Auth 中创建用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role: 'admin',
        },
      },
    });

    if (authError) {
      console.error('❌ 创建失败:', authError.message);

      // 如果是邮箱已存在的错误，尝试直接设置管理员权限
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        console.log('\n⚠️  邮箱已存在，尝试将该用户设置为管理员...\n');

        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('❌ 登录失败:', signInError.message);
          process.exit(1);
        }

        if (user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);

          if (updateError) {
            console.error('❌ 更新权限失败:', updateError.message);
            process.exit(1);
          }

          console.log('✅ 成功！用户已设置为管理员');
          console.log('\n📝 登录信息：');
          console.log(`   用户名/邮箱: ${username} 或 ${email}`);
          console.log(`   密码: ${password}`);
          process.exit(0);
        }
      }

      process.exit(1);
    }

    if (!authData.user) {
      console.error('❌ 创建失败：未知错误');
      process.exit(1);
    }

    console.log('✅ 用户创建成功！');
    console.log(`   Email: ${email}`);
    console.log(`   用户名: ${username}`);
    console.log(`   密码: ${password}`);

    // 2. 等待触发器创建 profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. 验证 profile 是否创建成功
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      console.error('⚠️  Profile 未自动创建，手动创建中...');

      // 手动创建 profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          email,
          role: 'admin',
        });

      if (insertError) {
        console.error('❌ 手动创建 profile 失败:', insertError.message);
        console.error('\n💡 提示：请检查以下内容：');
        console.error('   1. 是否已运行 complete-fix.sql 脚本');
        console.error('   2. profiles 表是否存在');
        console.error('   3. RLS 策略是否正确配置');
        process.exit(1);
      }
    } else {
      console.log('✅ Profile 创建成功！');
      console.log(`   角色: ${profileData.role}`);
    }

    console.log('\n🎉 管理员账号创建完成！');
    console.log('\n📝 登录信息：');
    console.log(`   用户名/邮箱: ${username} 或 ${email}`);
    console.log(`   密码: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    console.error('\n💡 提示：请检查以下内容：');
    console.error('   1. .env.local 配置是否正确');
    console.error('   2. Supabase 项目是否正常运行');
    console.error('   3. 网络连接是否正常');
    process.exit(1);
  }
}

createAdmin();
