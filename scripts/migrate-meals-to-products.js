#!/usr/bin/env node

/**
 * 数据迁移脚本：meals 表 → products 表
 * Issue #30 - CPS 上线验证
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Supabase 配置
const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function migrateMealsToProducts() {
  console.log('🚀 开始迁移 meals 表数据到 products 表...\n');
  
  // 1. 查询 meals 表的所有数据
  console.log('📊 查询 meals 表数据...');
  const { data: meals, error: mealsError } = await supabase
    .from('meals')
    .select('*');
  
  if (mealsError) {
    console.error('❌ 查询 meals 表失败:', mealsError.message);
    return false;
  }
  
  console.log(`✅ 找到 ${meals.length} 条 meals 记录\n`);
  
  if (meals.length === 0) {
    console.log('⚠️  meals 表为空，无需迁移');
    return true;
  }
  
  // 2. 迁移数据到 products 表
  console.log('📦 开始迁移数据到 products 表...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const meal of meals) {
    try {
      const { error } = await supabase
        .from('products')
        .upsert({
          id: meal.id,
          name: meal.name,
          img: meal.image_url,
          promo_url: meal.cps_link || meal.promo_url,
          cps_link: meal.cps_link,
          category: meal.category,
          price_min: meal.price,
          is_active: meal.is_active,
          sort_order: 0,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.error(`❌ 迁移失败 ${meal.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ 迁移成功：${meal.name}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ 迁移异常 ${meal.name}:`, err.message);
      errorCount++;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 数据迁移完成!');
  console.log(`   成功：${successCount} 条`);
  console.log(`   失败：${errorCount} 条`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // 3. 验证 products 表数据
  console.log('🔍 验证 products 表数据...');
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ 验证失败:', countError.message);
    return false;
  }
  
  console.log(`✅ products 表现在有 ${count} 条记录\n`);
  
  // 4. 提供删除 meals 表的 SQL
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  下一步操作：');
  console.log('1. 验证 products 表数据是否正确');
  console.log('2. 在 Supabase SQL Editor 执行以下命令删除 meals 表:');
  console.log('');
  console.log('   DROP TABLE meals;');
  console.log('');
  console.log('3. 验证应用功能正常');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return true;
}

// 执行迁移
migrateMealsToProducts()
  .then(success => {
    if (success) {
      console.log('✅ 迁移脚本执行完成');
      process.exit(0);
    } else {
      console.log('❌ 迁移脚本执行失败');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ 迁移过程中出错:', err);
    process.exit(1);
  });
