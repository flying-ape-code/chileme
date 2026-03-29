#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjYzMzEsImV4cCI6MjA4ODgwMjMzMX0.MNRD-6mK1ML3fBqupvX3Cet1lL4N9Hc9zCAB_4EbWNE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('🔍 检查重复商品...\n');
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('❌ 错误:', error.message);
    return;
  }
  
  console.log(`📦 总商品数：${data.length}`);
  
  const seen = new Map();
  const dupes = [];
  
  data.forEach(p => {
    const key = `${p.name.toLowerCase()}-${p.category || ''}`;
    if (seen.has(key)) {
      dupes.push(p);
    } else {
      seen.set(key, p);
    }
  });
  
  console.log(`⚠️  重复商品：${dupes.length} 个\n`);
  
  if (dupes.length === 0) {
    console.log('✅ 无重复商品！');
    return;
  }
  
  console.log('📋 重复商品:');
  dupes.slice(0, 20).forEach((d, i) => {
    console.log(`  ${i+1}. ${d.name} [${d.category || '无分类'}]`);
  });
  if (dupes.length > 20) console.log(`  ... 还有 ${dupes.length-20} 个`);
  console.log('');
  
  console.log('🗑️  删除重复商品...');
  const ids = dupes.map(d => d.id);
  
  const { error: delErr } = await supabase
    .from('products')
    .delete()
    .in('id', ids);
  
  if (delErr) {
    console.error('❌ 删除失败:', delErr.message);
    return;
  }
  
  console.log(`✅ 已删除 ${dupes.length} 个重复商品！\n`);
  
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📦 剩余商品：${count}`);
  console.log('\n✨ 完成！');
}

cleanup();
