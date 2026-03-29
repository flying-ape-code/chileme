#!/usr/bin/env node

/**
 * 删除重复商品数据脚本
 * 用于清理后台商品数据中的重复项
 */

const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误：缺少 Supabase 配置');
  console.error('请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_SERVICE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicateProducts() {
  console.log('🔍 开始检查重复商品...');
  console.log('');
  
  // 获取所有商品
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, original_price, category, image, created_at');
  
  if (error) {
    console.error('❌ 获取商品失败:', error.message);
    process.exit(1);
  }
  
  console.log(`📦 总商品数：${products.length}`);
  
  // 按名称分组找出重复项
  const productMap = new Map();
  const duplicates = [];
  
  products.forEach(product => {
    const key = `${product.name}-${product.price}-${product.category || ''}`.toLowerCase();
    if (productMap.has(key)) {
      duplicates.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        created_at: product.created_at
      });
    } else {
      productMap.set(key, product);
    }
  });
  
  console.log(`⚠️  发现重复商品：${duplicates.length} 个`);
  console.log('');
  
  if (duplicates.length === 0) {
    console.log('✅ 没有发现重复商品！');
    return;
  }
  
  // 显示重复商品列表
  console.log('📋 重复商品列表:');
  duplicates.slice(0, 20).forEach((dup, index) => {
    console.log(`  ${index + 1}. ${dup.name} - ¥${dup.price} [${dup.category || '无分类'}]`);
  });
  if (duplicates.length > 20) {
    console.log(`  ... 还有 ${duplicates.length - 20} 个`);
  }
  console.log('');
  
  // 删除重复商品
  console.log('🗑️  开始删除重复商品...');
  const duplicateIds = duplicates.map(d => d.id);
  
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .in('id', duplicateIds);
  
  if (deleteError) {
    console.error('❌ 删除失败:', deleteError.message);
    process.exit(1);
  }
  
  console.log(`✅ 成功删除 ${duplicates.length} 个重复商品！`);
  console.log('');
  
  // 验证结果
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📦 剩余商品数：${count}`);
  console.log('');
  console.log('✨ 完成！');
}

// 执行
removeDuplicateProducts().catch(err => {
  console.error('❌ 执行失败:', err.message);
  process.exit(1);
});
