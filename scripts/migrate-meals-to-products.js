/**
 * V3.0 数据迁移脚本：meals 表 → products 表
 * Issue: #27
 * 
 * 使用方法：
 * node scripts/migrate-meals-to-products.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误：请设置 Supabase 环境变量');
  console.error('需要：VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY (或 SUPABASE_SERVICE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateMealsToProducts() {
  console.log('🚀 开始迁移 meals 表数据到 products 表...\n');

  try {
    // 1. 获取 meals 表的所有数据
    console.log('📊 步骤 1: 读取 meals 表数据...');
    const { data: meals, error: fetchError } = await supabase
      .from('meals')
      .select('*');

    if (fetchError) {
      console.error('❌ 读取 meals 表失败:', fetchError.message);
      return;
    }

    console.log(`✅ 找到 ${meals.length} 条 meals 记录\n`);

    if (meals.length === 0) {
      console.log('⚠️  meals 表为空，无需迁移');
      return;
    }

    // 2. 将数据插入 products 表
    console.log('📊 步骤 2: 迁移数据到 products 表...');
    const productsToInsert = meals.map(meal => ({
      id: meal.id,
      name: meal.name,
      img: meal.image_url,
      promoUrl: meal.promoUrl || null,
      cpsLink: meal.cps_link || null,
      category: meal.category,
      priceMin: meal.price_min || null,
      priceMax: meal.price_max || null,
      rating: meal.rating || null,
      distance: meal.distance || null,
      deliveryTime: meal.delivery_time || null,
      isActive: meal.is_active ?? true,
      sortOrder: meal.sort_order ?? 0,
      createdAt: meal.created_at,
      updatedAt: meal.updated_at || new Date().toISOString()
    }));

    // 分批插入，每批 100 条
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'id' });

      if (insertError) {
        console.error(`❌ 插入第 ${i/batchSize + 1} 批失败:`, insertError.message);
        return;
      }

      inserted += batch.length;
      console.log(`  ✓ 已插入 ${inserted}/${productsToInsert.length} 条记录`);
    }

    console.log(`✅ 成功迁移 ${inserted} 条记录到 products 表\n`);

    // 3. 验证迁移结果
    console.log('📊 步骤 3: 验证迁移结果...');
    const { count: productsCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 验证失败:', countError.message);
      return;
    }

    console.log(`✅ products 表现有 ${productsCount} 条记录`);
    console.log(`✅ meals 表原有 ${meals.length} 条记录\n`);

    // 4. 按分类统计
    console.log('📊 步骤 4: 按分类统计...');
    const categories = ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'];
    for (const category of categories) {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);
      console.log(`  ${category}: ${count || 0} 条`);
    }

    // 5. 删除 meals 表（需要确认）
    console.log('\n⚠️  准备删除 meals 表...');
    const confirmDelete = process.argv.includes('--delete-meals');
    
    if (confirmDelete) {
      console.log('📊 步骤 5: 删除 meals 表...');
      // 注意：Supabase JS SDK 不能直接删除表，需要在 SQL Editor 中执行
      console.log('⚠️  请手动在 Supabase SQL Editor 中执行：DROP TABLE meals;');
      console.log('✅ 迁移完成！\n');
    } else {
      console.log('💡 提示：如需删除 meals 表，请添加 --delete-meals 参数重新运行');
      console.log('   或手动在 Supabase SQL Editor 中执行：DROP TABLE meals;');
      console.log('\n✅ 数据迁移完成！\n');
    }

  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行迁移
migrateMealsToProducts();
