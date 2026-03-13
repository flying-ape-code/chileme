/**
 * 创建管理员账号的临时脚本
 * 使用方法：node scripts/create-admin.js
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 从环境变量读取配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误：未找到 Supabase 配置');
  console.error('请确保 .env.local 文件中配置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function createAdmin() {
  console.log('\n🚀 创建管理员账号\n');

  const username = await question('管理员用户名 [默认: admin]: ') || 'admin';
  const email = await question('管理员邮箱 [默认: admin@chileme.com]: ') || 'admin@chileme.com';
  const password = await question('管理员密码 [默认: 123456]: ') || '123456';

  console.log('\n⏳ 正在创建管理员账号...\n');

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
      if (authError.message.includes('already registered')) {
        console.log('\n⚠️  邮箱已存在，尝试将该用户设置为管理员...\n');

        const { data: { user } } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (user) {
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);

          console.log('✅ 成功！用户已设置为管理员');
          rl.close();
          return;
        }
      }

      rl.close();
      process.exit(1);
    }

    if (!authData.user) {
      console.error('❌ 创建失败：未知错误');
      rl.close();
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
        rl.close();
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

    rl.close();
  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
