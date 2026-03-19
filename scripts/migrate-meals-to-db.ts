/**
 * 商品数据迁移脚本
 * 将 meals-data.json 迁移到 Supabase meals 表
 */

import { createClient } from '@supabase/supabase-js';
import mealsData from '../meals-data.json';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface MealData {
  name: string;
  emoji: string;
  weirdName: string;
  weirdEmoji: string;
  category: string;
}

async function migrateMeals() {
  console.log('🚀 开始迁移商品数据...');
  
  const categoryMap: Record<string, string> = {
    '早餐': 'breakfast',
    '午餐': 'lunch',
    '下午茶': 'afternoon-tea',
    '晚餐': 'dinner',
    '夜宵': 'night-snack'
  };
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [category, items] of Object.entries(mealsData)) {
    const englishCategory = categoryMap[category] || category;
    
    console.log(`📦 处理分类：${category} (${englishCategory})`);
    
    for (const item of items as MealData[]) {
      try {
        const { error } = await supabase
          .from('meals')
          .insert([{
            name: item.name,
            category: englishCategory,
            image_url: `https://example.com/${item.name}.jpg`, // TODO: 实际图片 URL
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
        console.error(`❌ 异常 ${item.name}:`, err);
        errorCount++;
      }
    }
  }
  
  console.log(`\n✅ 迁移完成！`);
  console.log(`成功：${successCount}`);
  console.log(`失败：${errorCount}`);
}

migrateMeals().catch(console.error);
