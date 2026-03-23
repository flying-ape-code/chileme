/**
 * CPS 链接格式修复脚本
 * 将错误的 CPS 链接格式转换为正确格式
 */

const https = require('https');

const SUPABASE_URL = 'https://isefskqnkeesepcczbyo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

const POSITION_ID = 'shipinwaimai';
const CHANNEL_ID = '473920';

/**
 * 生成正确的 CPS 链接格式
 */
function generateCorrectCPSLink(productId) {
  return `https://u.meituan.com/cps/promotion?position_id=${POSITION_ID}&goods_id=${productId}&channel_id=${CHANNEL_ID}`;
}

/**
 * 获取所有产品
 */
async function getProducts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/products?select=id,name,category,cps_link',
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * 更新产品 CPS 链接
 */
async function updateProduct(productId, cpsLink) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ cps_link: cpsLink });

    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: `/rest/v1/products?id=eq.${productId}`,
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 204) {
        resolve(true);
      } else {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => reject(new Error(body)));
      }
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始批量修复 CPS 链接格式...\n');
  
  const products = await getProducts();
  
  console.log(`📦 找到 ${products.length} 个商品\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const product of products) {
    const correctCPSLink = generateCorrectCPSLink(product.id);
    
    console.log(`处理：${product.name}`);
    console.log(`  旧格式：${product.cps_link || '无'}`);
    console.log(`  新格式：${correctCPSLink}`);
    
    try {
      await updateProduct(product.id, correctCPSLink);
      console.log(`  ✅ 更新成功\n`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ 更新失败：${error.message}\n`);
      failCount++;
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('========================================');
  console.log(`✅ 修复完成！`);
  console.log(`成功：${successCount} 个`);
  console.log(`失败：${failCount} 个`);
  console.log('========================================');
}

main().catch(console.error);
