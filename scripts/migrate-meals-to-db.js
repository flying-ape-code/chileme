/**
 * V2.1 数据迁移脚本：meals-data.json → Supabase meals 表
 * 
 * 使用方法:
 * 1. 确保 .env 文件包含 Supabase 配置
 * 2. 运行：node scripts/migrate-meals-to-db.js
 */

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 初始化 Supabase 客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误：缺少 Supabase 配置');
  console.error('请确保 .env 文件包含:');
  console.error('  VITE_SUPABASE_URL=your-supabase-url');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 读取 meals-data.json
const mealsDataPath = path.join(__dirname, '..', 'meals-data.json');
const mealsData = JSON.parse(fs.readFileSync(mealsDataPath, 'utf-8'));

console.log('📦 开始数据迁移...');
console.log('源文件:', mealsDataPath);
console.log('Supabase URL:', supabaseUrl);

async function migrate() {
  let totalInserted = 0;
  let totalSkipped = 0;
  const errors = [];

  // 遍历所有分类
  for (const [category, items] of Object.entries(mealsData)) {
    console.log(`\n📂 处理分类：${category} (${items.length} 个商品)`);

    for (const [index, item] of items.entries()) {
      try {
        // 检查是否已存在（根据名称和分类）
        const { data: existing } = await supabase
          .from('meals')
          .select('id')
          .eq('name', item.name)
          .eq('category', category)
          .single();

        if (existing) {
          console.log(`  ⏭️  跳过：${item.name} (已存在)`);
          totalSkipped++;
          continue;
        }

        // 插入数据
        const mealData = {
          name: item.name,
          category: category,
          image_url: item.img,
          cps_link: item.promoUrl || null,
          is_active: true,
          sort_order: index,
          rating: 4.5, // 默认评分
          created_at: item.crawledAt || new Date().toISOString()
        };

        const { error } = await supabase.from('meals').insert([mealData]);

        if (error) {
          throw error;
        }

        console.log(`  ✅ 插入：${item.name}`);
        totalInserted++;
      } catch (err) {
        console.error(`  ❌ 错误：${item.name} - ${err.message}`);
        errors.push({ item: item.name, error: err.message });
      }
    }
  }

  // 统计结果
  console.log('\n' + '='.repeat(50));
  console.log('📊 迁移完成');
  console.log('='.repeat(50));
  console.log(`✅ 成功插入：${totalInserted} 个商品`);
  console.log(`⏭️  跳过：${totalSkipped} 个商品`);
  console.log(`❌ 失败：${errors.length} 个商品`);

  if (errors.length > 0) {
    console.log('\n错误详情:');
    errors.forEach(({ item, error }) => {
      console.log(`  - ${item}: ${error}`);
    });
  }

  // 验证数据
  console.log('\n🔍 验证数据...');
  const { count, error: countError } = await supabase
    .from('meals')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ 验证失败:', countError.message);
  } else {
    console.log(`✅ 数据库中共有 ${count} 个商品`);
  }

  // 按分类统计
  console.log('\n📈 分类统计:');
  for (const category of ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack']) {
    const { count } = await supabase
      .from('meals')
      .select('*', { count: 'exact', head: true })
      .eq('category', category);
    console.log(`  ${category}: ${count} 个商品`);
  }
}

// 执行迁移
migrate().catch(err => {
  console.error('❌ 迁移失败:', err);
  process.exit(1);
});
