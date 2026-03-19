/**
 * 商品数据每日更新脚本
 * 定时检查商品数据有效性并更新
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkImageValidity(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
    return response.ok;
  } catch {
    return false;
  }
}

async function updateDaily() {
  console.log('🔄 开始每日更新...');
  
  // 获取所有商品
  const { data: meals, error } = await supabase
    .from('meals')
    .select('*')
    .eq('is_active', true);
  
  if (error) {
    console.error('❌ 获取商品失败:', error.message);
    return;
  }
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const meal of meals) {
    const isValid = await checkImageValidity(meal.image_url);
    
    if (!isValid) {
      console.log(`❌ 图片失效：${meal.name}`);
      await supabase
        .from('meals')
        .update({ is_active: false })
        .eq('id', meal.id);
      invalidCount++;
    } else {
      validCount++;
    }
  }
  
  console.log(`✅ 更新完成：有效 ${validCount}, 失效 ${invalidCount}`);
}

updateDaily().catch(console.error);
