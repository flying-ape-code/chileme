/**
 * V2.1 环境验证脚本
 * 使用方法：node scripts/verify-setup.js
 */

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 V2.1 环境验证\n');

// 检查环境变量
console.log('1️⃣  检查环境变量...');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes('CHANGE_ME') || supabaseUrl.includes('YOUR_')) {
  console.log('   ❌ VITE_SUPABASE_URL 未配置或使用占位符');
} else {
  console.log('   ✅ VITE_SUPABASE_URL 已配置');
}

if (!supabaseKey || supabaseKey.includes('CHANGE_ME') || supabaseKey.includes('YOUR_')) {
  console.log('   ❌ Supabase Key 未配置或使用占位符');
} else {
  console.log('   ✅ Supabase Key 已配置');
}

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('CHANGE_ME') || supabaseKey.includes('CHANGE_ME')) {
  console.log('\n⚠️  请先在 .env 文件中配置 Supabase 密钥\n');
  process.exit(1);
}

// 初始化 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 测试连接
async function verify() {
  console.log('\n2️⃣  测试 Supabase 连接...');
  try {
    const { data, error } = await supabase.from('meals').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.message.includes('relation "meals" does not exist')) {
        console.log('   ⚠️  meals 表不存在，请先执行数据库迁移');
      } else {
        console.log('   ❌ 连接失败:', error.message);
      }
      return;
    }
    
    console.log('   ✅ Supabase 连接成功');
  } catch (err) {
    console.log('   ❌ 连接失败:', err.message);
    return;
  }

  // 检查数据
  console.log('\n3️⃣  检查数据...');
  try {
    const { count, error } = await supabase.from('meals').select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('   ❌ 查询失败:', error.message);
      return;
    }
    
    console.log(`   ✅ meals 表共有 ${count} 条记录`);
    
    if (count === 0) {
      console.log('   ⚠️  meals 表为空，请执行数据迁移');
    } else if (count === 15) {
      console.log('   ✅ 数据量正确（15 条商品）');
    } else {
      console.log(`   ⚠️  数据量异常（预期 15 条，实际 ${count} 条）`);
    }
  } catch (err) {
    console.log('   ❌ 查询失败:', err.message);
  }

  // 分类统计
  console.log('\n4️⃣  分类统计...');
  try {
    const categories = ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'];
    const categoryNames = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'afternoon-tea': '下午茶',
      'dinner': '晚餐',
      'night-snack': '夜宵'
    };
    
    for (const category of categories) {
      const { count } = await supabase
        .from('meals')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);
      
      const status = count === 3 ? '✅' : '⚠️';
      console.log(`   ${status} ${categoryNames[category]}: ${count} 条`);
    }
  } catch (err) {
    console.log('   ❌ 统计失败:', err.message);
  }

  // 活跃商品统计
  console.log('\n5️⃣  活跃商品统计...');
  try {
    const { count: activeCount } = await supabase
      .from('meals')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log(`   ✅ 活跃商品：${activeCount} 条`);
  } catch (err) {
    console.log('   ❌ 查询失败:', err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ 验证完成\n');
}

verify().catch(err => {
  console.error('❌ 验证失败:', err);
  process.exit(1);
});
