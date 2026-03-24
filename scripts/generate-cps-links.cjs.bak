/**
 * 订单侠 CPS 链接生成器
 * 批量生成真实的 CPS 推广链接
 */

const https = require('https');

// API 配置
const API_KEY = process.env.VITE_DINGDANXIA_APIKEY || 'Ww9xkFpD8lfGswr4UleNjsQoxMHyeiWR';
const API_BASE = 'https://api.dingdanxia.com';

// 美团联盟官方推广位 ID
const MEITUAN_POSITION_ID = 'shipinwaimai'; // 食品外卖分类
const MEITUAN_CHANNEL_ID = '473920'; // 官方渠道 ID

/**
 * 生成美团 CPS 链接
 * @param {string} originalUrl - 原始美团链接
 * @param {string} goodsId - 商品 ID
 * @returns {Promise<string>} CPS 推广链接
 */
async function generateCPSLink(originalUrl, goodsId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      apikey: API_KEY,
      type: 'meituan',
      position_id: MEITUAN_POSITION_ID,
      channel_id: MEITUAN_CHANNEL_ID,
      goods_id: goodsId,
      original_url: originalUrl
    });

    const options = {
      hostname: 'api.dingdanxia.com',
      port: 443,
      path: '/api/cps/convert',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.code === 200 && result.data && result.data.cps_url) {
            console.log(`✅ CPS 链接生成成功：${result.data.cps_url}`);
            resolve(result.data.cps_url);
          } else {
            console.warn(`⚠️  CPS 链接生成失败：${result.message || '未知错误'}`);
            resolve(null);
          }
        } catch (e) {
          console.error(`❌ 解析失败：${e.message}`);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ 请求失败：${e.message}`);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * 批量生成 CPS 链接
 */
async function batchGenerate() {
  console.log('🚀 开始批量生成 CPS 链接...\n');
  
  // 从数据库获取商品列表
  const products = [
    { id: 'abab7e04-de2c-4391-9793-da6ad0ec6af7', name: '煎饼果子', promo_url: 'https://i.meituan.com/example1' },
    { id: 'a194b464-10fa-469e-858b-6c0089fec65e', name: '黄焖鸡', promo_url: 'https://i.meituan.com/example3' },
    { id: 'a2adb87e-56f1-478c-88d8-6280a73d1b2c', name: '水果茶', promo_url: 'https://i.meituan.com/afternoon-tea/水果茶' },
    { id: 'fee67365-91e4-47c9-8bae-b51e50657616', name: '沙拉', promo_url: 'https://i.meituan.com/afternoon-tea/沙拉' },
    { id: 'deade448-a29f-4d8b-98a4-eff49193732c', name: '烤鱼', promo_url: 'https://i.meituan.com/dinner/烤鱼' }
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const product of products) {
    console.log(`\n📦 处理商品：${product.name}`);
    
    try {
      const cpsUrl = await generateCPSLink(product.promo_url, product.id);
      
      if (cpsUrl) {
        console.log(`✅ ${product.name}: ${cpsUrl}`);
        successCount++;
        
        // 更新数据库
        await updateProductCPSLink(product.id, cpsUrl);
      } else {
        console.log(`❌ ${product.name}: 生成失败`);
        failCount++;
      }
    } catch (error) {
      console.error(`❌ ${product.name}: ${error.message}`);
      failCount++;
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n========================================');
  console.log(`✅ 生成完成！`);
  console.log(`成功：${successCount} 个`);
  console.log(`失败：${failCount} 个`);
  console.log('========================================\n');
}

/**
 * 更新数据库中的 CPS 链接
 */
async function updateProductCPSLink(productId, cpsUrl) {
  const https = require('https');
  
  return new Promise((resolve, reject) => {
    const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';
    
    const postData = JSON.stringify({ cps_link: cpsUrl });
    
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: `/rest/v1/products?id=eq.${productId}`,
      method: 'PATCH',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
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

// 执行
batchGenerate().catch(console.error);
