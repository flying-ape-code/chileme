/**
 * 最终数据迁移脚本
 * 使用正确的 Supabase 客户端配置
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const mealsData = require('../meals-data.json');

const categoryMap = {
  'breakfast': 'breakfast',
  'lunch': 'lunch',
  'afternoon-tea': 'afternoon-tea',
  'dinner': 'dinner',
  'night-snack': 'night-snack'
};

async function migrateMeals() {
  console.log('🚀 开始迁移商品数据到数据库...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [category, items] of Object.entries(mealsData)) {
    console.log(`\n📦 处理分类：${category}`);
    
    for (const item of items) {
      try {
        const { data, error } = await supabase
          .from('meals')
          .insert([{
            name: item.name,
            category: categoryMap[category] || category,
            image_url: item.img,
            cps_link: item.promoUrl || '',
            is_active: true
          }])
          .select();
        
        if (error) {
          console.error(`❌ ${item.name}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ ${item.name} → ID: ${data[0].id}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ ${item.name}: ${err.message}`);
        errorCount++;
      }
    }
  }
  
  console.log(`\n========================================`);
  console.log(`✅ 迁移完成！`);
  console.log(`成功：${successCount}`);
  console.log(`失败：${errorCount}`);
  console.log(`========================================`);
}

migrateMeals().catch(console.error);
