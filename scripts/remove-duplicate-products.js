// 删除重复商品脚本
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取环境变量
const envPath = join(__dirname, '..', '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误：缺少 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAndRemoveDuplicates() {
  console.log('🔍 开始检查重复商品...\n');
  
  // 获取所有商品
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
      console.log(`\n⚠️  重复商品："${name}" (${items.length} 个)`);
      
      // 保留第一个，删除其余的
      const keep = items[0];
      const duplicates = items.slice(1);
      
      console.log(`   ✅ 保留：${keep.id} (创建时间：${keep.created_at})`);
      
      duplicates.forEach(item => {
        console.log(`   ❌ 删除：${item.id} (创建时间：${item.created_at})`);
        toDelete.push(item.id);
        deleteCount++;
      });
    }
  });
  
  if (duplicateCount === 0) {
    console.log('\n✅ 没有发现重复商品！');
    return;
  }
  
  console.log(`\n📊 统计：${duplicateCount} 个商品有重复，共 ${deleteCount} 条重复记录待删除`);
  console.log('\n⏸️  等待 3 秒后开始删除... (按 Ctrl+C 取消)');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 执行删除
  console.log('\n🗑️  开始删除重复商品...');
  for (const id of toDelete) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`   ❌ 删除 ${id} 失败：${error.message}`);
    } else {
      console.log(`   ✅ 已删除：${id}`);
    }
  }
  
  console.log('\n✅ 完成！共删除 ${deleteCount} 个重复商品');
}

findAndRemoveDuplicates();
