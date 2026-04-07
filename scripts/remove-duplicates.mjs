// 删除重复商品脚本 - 并发版本
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjYzMzEsImV4cCI6MjA4ODgwMjMzMX0.MNRD-6mK1ML3fBqupvX3Cet1lL4N9Hc9zCAB_4EbWNE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicates() {
  console.log('🔍 查询所有商品...\n');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('❌ 查询失败:', error.message);
    return;
  }
  
  console.log(`📦 总商品数：${products.length}`);
  
  // 按名称分组
  const nameMap = new Map();
  products.forEach(product => {
    const name = product.name.trim();
    if (!nameMap.has(name)) {
      nameMap.set(name, []);
    }
    nameMap.get(name).push(product);
  });
  
  // 找出重复的
  let duplicateCount = 0;
  let deleteCount = 0;
  const toDelete = [];
  
  nameMap.forEach((items, name) => {
    if (items.length > 1) {
      duplicateCount++;
      const keep = items[0]; // 保留最早创建的
      const duplicates = items.slice(1);
      
      duplicates.forEach(item => {
        toDelete.push(item.id);
        deleteCount++;
      });
    }
  });
  
  if (duplicateCount === 0) {
    console.log('\n✅ 没有发现重复商品！');
    return;
  }
  
  console.log(`\n📊 统计：${duplicateCount} 个商品有重复，共 ${deleteCount} 条重复记录待删除\n`);
  console.log('⏸️  等待 3 秒后开始删除... (按 Ctrl+C 取消)\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 并发删除（每批 50 个）
  console.log('🗑️  开始删除重复商品...');
  let successCount = 0;
  let failCount = 0;
  const batchSize = 50;
  
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);
    const promises = batch.map(id => 
      supabase.from('products').delete().eq('id', id)
    );
    
    const results = await Promise.all(promises);
    results.forEach(({ error }) => {
      if (error) failCount++;
      else successCount++;
    });
    
    const progress = Math.min(i + batchSize, toDelete.length);
    console.log(`   进度：${progress}/${deleteCount} (成功：${successCount}, 失败：${failCount})`);
  }
  
  console.log(`\n✅ 完成！成功删除 ${successCount} 个，失败 ${failCount} 个`);
  console.log(`📦 剩余商品数：${products.length - successCount}`);
}

removeDuplicates();
