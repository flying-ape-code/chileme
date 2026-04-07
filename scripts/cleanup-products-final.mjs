// 清理 products 表重复数据 - 循环执行直到干净
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjYzMzEsImV4cCI6MjA4ODgwMjMzMX0.MNRD-6mK1ML3fBqupvX3Cet1lL4N9Hc9zCAB_4EbWNE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupProducts() {
  let totalDeleted = 0;
  let iteration = 0;
  
  while (true) {
    iteration++;
    console.log(`\n=== 第 ${iteration} 轮清理 ===\n`);
    
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (!products || products.length === 0) {
      console.log('✅ 数据库为空！');
      break;
    }
    
    // 按名称 + 分类分组
    const keyMap = new Map();
    products.forEach(product => {
      const key = `${product.name.trim()}__${product.category || 'default'}`;
      if (!keyMap.has(key)) keyMap.set(key, []);
      keyMap.get(key).push(product);
    });
    
    // 找出重复的
    const toDelete = [];
    keyMap.forEach((items) => {
      if (items.length > 1) {
        const duplicates = items.slice(1);
        duplicates.forEach(item => toDelete.push(item.id));
      }
    });
    
    if (toDelete.length === 0) {
      console.log('✅ 无重复数据！');
      break;
    }
    
    console.log(`发现 ${toDelete.length} 条重复记录待删除`);
    
    // 批量删除（每批 50 个）
    let successCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize);
      const promises = batch.map(id => supabase.from('products').delete().eq('id', id));
      const results = await Promise.all(promises);
      results.forEach(({ error }) => { if (!error) successCount++; });
    }
    
    totalDeleted += successCount;
    console.log(`本轮删除 ${successCount} 条`);
  }
  
  console.log(`\n=== 清理完成 ===`);
  console.log(`总共删除：${totalDeleted} 条重复记录`);
  
  // 最终验证
  const { data: final } = await supabase.from('products').select('*');
  const finalMap = new Map();
  final.forEach(p => {
    const key = `${p.name.trim()}__${p.category || 'default'}`;
    if (!finalMap.has(key)) finalMap.set(key, 0);
    finalMap.set(key, finalMap.get(key) + 1);
  });
  
  let stillDuplicate = 0;
  finalMap.forEach((count) => { if (count > 1) stillDuplicate++; });
  
  console.log(`最终商品数：${final.length}`);
  console.log(`唯一商品数：${finalMap.size}`);
  if (stillDuplicate === 0) {
    console.log('✅ 验证通过：无重复商品！');
  } else {
    console.log(`⚠️  仍有 ${stillDuplicate} 组重复`);
  }
}

cleanupProducts();
