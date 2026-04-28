/**
 * 同步 meals 表数据到 meals-data.json
 * 让转盘使用最新爬虫数据
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function syncMealsData() {
  console.log('🔄 开始同步数据...');
  
  // 获取所有商品
  const { data: meals, error } = await supabase
    .from('meals')
    .select('name, image_url, cps_link, category, created_at')
    .eq('is_active', true);
  
  if (error) {
    console.error('❌ 获取数据失败:', error.message);
    return;
  }
  
  // 按分类整理
  const mealsData = {
    breakfast: [],
    lunch: [],
    'afternoon-tea': [],
    dinner: [],
    'night-snack': []
  };
  
  for (const meal of meals) {
    const category = meal.category;
    if (mealsData[category]) {
      mealsData[category].push({
        name: meal.name,
        img: meal.image_url,
        promoUrl: meal.cps_link || '',
        crawledAt: meal.created_at
      });
    }
  }
  
  // 写入文件
  writeFileSync('meals-data.json', JSON.stringify(mealsData, null, 2));
  
  console.log('✅ 数据同步完成！');
  console.log('分类统计:');
  for (const [category, items] of Object.entries(mealsData)) {
    console.log(`  ${category}: ${items.length} 个商品`);
  }
}

syncMealsData().catch(console.error);
