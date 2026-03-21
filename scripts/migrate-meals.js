#!/usr/bin/env node

/**
 * 数据迁移脚本：meals-data.json → Supabase meals 表
 * V2.1: 统一商品数据源
 */

const fs = require('fs');
const path = require('path');

// 检查 dotenv
try {
  require('dotenv').config({ path: '.env' });
} catch (e) {
  console.log('⚠️ 未找到 .env 文件，使用环境变量');
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误：缺少 Supabase 配置');
  console.error('请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  console.error('');
  console.error('解决方法:');
  console.error('1. 复制 .env.example 为 .env');
  console.error('2. 填入你的 Supabase 配置');
  console.error('3. 重新运行此脚本');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 数据文件路径
const dataFilePath = path.join(process.cwd(), 'meals-data.json');

// 读取本地数据
function loadData() {
  if (!fs.existsSync(dataFilePath)) {
    console.error(`❌ 错误：数据文件不存在 ${dataFilePath}`);
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  console.log(`✅ 加载数据成功：${Object.keys(data).length} 个分类`);
  return data;
}

// 迁移数据
async function migrate() {
  const data = loadData();
  
  console.log('\n🚀 开始迁移数据到 Supabase meals 表...\n');
  
  let totalInserted = 0;
  let totalFailed = 0;
  
  for (const [category, items] of Object.entries(data)) {
    console.log(`📦 迁移分类：${category} (${items.length} 个商品)`);
    
    for (const item of items) {
      const { error } = await supabase
        .from('meals')
        .insert({
          name: item.name,
          category: category,
          image_url: item.img,
          cps_link: item.promoUrl || null,
          is_active: true,
          sort_order: 0
        });
      
      if (error) {
        console.error(`  ❌ 迁移失败 ${item.name}:`, error.message);
        totalFailed++;
      } else {
        console.log(`  ✅ 迁移成功：${item.name}`);
        totalInserted++;
      }
    }
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 迁移完成!`);
  console.log(`   成功：${totalInserted} 个商品`);
  console.log(`   失败：${totalFailed} 个商品`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 执行迁移
migrate().catch(err => {
  console.error('❌ 迁移过程中出错:', err);
  process.exit(1);
});
