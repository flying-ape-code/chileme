/**
 * 简单的数据迁移脚本
 * 将 meals-data.json 迁移到 Supabase meals 表
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// 读取现有数据
const mealsData = JSON.parse(readFileSync('meals-data.json', 'utf-8'));

const categoryMap = {
  'breakfast': 'breakfast',
  'lunch': 'lunch',
  'afternoon-tea': 'afternoon-tea',
  'dinner': 'dinner',
  'night-snack': 'night-snack'
};

async function migrateMeals() {
  console.log('🚀 开始迁移商品数据...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [category, items] of Object.entries(mealsData)) {
    console.log(`📦 处理分类：${category}`);
    
    for (const item of items) {
      try {
        const { error } = await supabase
          .from('meals')
          .insert([{
            name: item.name,
            category: categoryMap[category] || category,
            image_url: item.img,
            cps_link: item.promoUrl || '',
            is_active: true
          }]);
        
        if (error) {
          console.error(`❌ 插入失败 ${item.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ 插入成功 ${item.name}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ 异常 ${item.name}:`, err.message);
        errorCount++;
      }
    }
  }
  
  console.log(`\n✅ 迁移完成！`);
  console.log(`成功：${successCount}`);
  console.log(`失败：${errorCount}`);
}

migrateMeals().catch(console.error);
