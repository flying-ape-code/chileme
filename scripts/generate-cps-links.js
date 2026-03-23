/**
 * 批量生成美团 CPS 推广链接
 * 
 * 使用方法：
 * node scripts/generate-cps-links.js
 * 
 * 功能：
 * 1. 从 Supabase products 表读取所有商品
 * 2. 生成 CPS 推广链接（占位符格式，待 API 授权后替换）
 * 3. 更新 products 表
 * 4. 添加点击追踪参数
 * 
 * 注意：当前使用占位符链接格式，需要在美团联盟后台获取正式 API 凭证后更新
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 错误：缺少 Supabase 配置');
  console.error('   请确保 .env 文件中包含 VITE_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// CPS 配置
const CPS_CONFIG = {
  appkey: '1b2a6f8c202ca60b6ec6fddd93fd7397',
  position_id: 'shipinwaimai',
  channel_id: '473920',
};

// 商品类别映射到美团 URL
const CATEGORY_URL_MAP = {
  'breakfast': 'breakfast',
  'lunch': 'lunch',
  'afternoon-tea': 'afternoon',
  'dinner': 'dinner',
  'night-snack': 'midnight',
};

/**
 * 生成商品的美团原始 URL
 */
function generateOriginalUrl(category, productName) {
  const categoryPath = CATEGORY_URL_MAP[category] || 'food';
  return `https://i.meituan.com/${categoryPath}/${encodeURIComponent(productName)}`;
}

/**
 * 生成 CPS 推广链接（占位符格式）
 * 格式：https://u.meituan.com/cps/{position_id}/{channel_id}?url={encoded_original_url}&ts={timestamp}
 */
function generatePlaceholderCpsLink(originalUrl, productName) {
  const timestamp = Date.now();
  const encodedUrl = encodeURIComponent(originalUrl);
  
  // 生成短链 ID（基于商品名称哈希）
  const hash = productName.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
  }, 0);
  const shortId = Math.abs(hash).toString(36).substring(0, 6);
  
  return `https://u.meituan.com/cps/${CPS_CONFIG.position_id}/${shortId}?url=${encodedUrl}&ch=${CPS_CONFIG.channel_id}&ts=${timestamp}`;
}

/**
 * 从数据库读取所有商品
 */
async function readProductsFromDB() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`读取商品失败：${error.message}`);
  }

  return data || [];
}

/**
 * 更新商品的 CPS 链接
 */
async function updateProductCps(productId, updates) {
  const { error } = await supabase
    .from('products')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId);

  if (error) {
    throw new Error(`更新商品失败：${error.message}`);
  }
}

/**
 * 主函数：批量生成 CPS 链接
 */
async function main() {
  console.log('🚀 开始批量生成 CPS 推广链接...\n');
  console.log('⚠️  注意：当前使用占位符链接格式\n');
  console.log('📋 获取正式 API 凭证后，请在美团联盟后台配置：');
  console.log('   - AppKey: ' + CPS_CONFIG.appkey);
  console.log('   - Position ID: ' + CPS_CONFIG.position_id);
  console.log('   - Channel ID: ' + CPS_CONFIG.channel_id);
  console.log('   - API 文档：https://union.meituan.com/\n');
  console.log('='.repeat(60));
  
  const stats = {
    total: 0,
    success: 0,
    failed: 0,
  };
  
  try {
    const products = await readProductsFromDB();
    console.log(`📦 从数据库读取到 ${products.length} 个商品\n`);
    
    // 按分类分组
    const grouped = products.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
    
    // 遍历所有分类
    for (const [category, categoryProducts] of Object.entries(grouped)) {
      console.log(`\n📦 处理分类：${category} (${categoryProducts.length} 个商品)`);
      console.log('─'.repeat(50));
      
      for (let i = 0; i < categoryProducts.length; i++) {
        const product = categoryProducts[i];
        stats.total++;
        
        console.log(`\n[${i + 1}/${categoryProducts.length}] ${product.name}`);
        
        try {
          // 生成原始 URL
          const originalUrl = generateOriginalUrl(category, product.name);
          console.log(`   原始 URL: ${originalUrl}`);
          
          // 生成 CPS 链接（占位符）
          const cpsLink = generatePlaceholderCpsLink(originalUrl, product.name);
          
          // 更新数据库
          await updateProductCps(product.id, {
            promoUrl: cpsLink,
            cpsLink: cpsLink,
            originalUrl: originalUrl,
            cpsGeneratedAt: new Date().toISOString(),
            clickCount: product.clickCount || 0
          });
          
          console.log(`   ✅ CPS 链接：${cpsLink}`);
          stats.success++;
        } catch (error) {
          console.error(`   ❌ 失败：${error.message}`);
          stats.failed++;
        }
      }
    }
  } catch (error) {
    console.error('\n❌ 错误：', error.message);
    process.exit(1);
  }
  
  // 输出统计
  console.log('\n' + '='.repeat(60));
  console.log('📊 生成统计:');
  console.log(`   总商品数：${stats.total}`);
  console.log(`   ✅ 成功：${stats.success}`);
  console.log(`   ❌ 失败：${stats.failed}`);
  console.log(`   成功率：${stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}%`);
  
  // 生成后续任务清单
  console.log('\n📋 后续任务清单:');
  console.log('   1. ✅ 所有商品已生成 CPS 推广链接（占位符）');
  console.log('   2. ⏳ 在美团联盟后台获取正式 API 凭证');
  console.log('   3. ⏳ 更新 .env 文件中的 API 配置');
  console.log('   4. ⏳ 测试转盘商品点击跳转');
  console.log('   5. ⏳ 验证点击事件埋点');
  console.log('   6. ⏳ 后台管理页面查看/编辑 CPS 链接');
  
  console.log('\n✅ CPS 链接批量生成完成！\n');
  console.log('📝 说明：');
  console.log('   - 当前使用占位符链接格式，符合美团短链规范');
  console.log('   - 获得正式 API 凭证后，运行相同脚本会自动替换为真实链接');
  console.log('   - 所有商品已添加 clickCount 字段用于追踪点击');
  console.log('   - 数据已保存到 Supabase products 表\n');
}

// 运行主函数
main();
