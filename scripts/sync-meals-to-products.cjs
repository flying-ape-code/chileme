/**
 * 同步 meals 表数据到 products 表
 * 让后台管理可以看到爬虫数据
 */

const https = require('https');

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

function queryMeals() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/meals?select=id,name,image_url,cps_link,category,is_active',
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

function insertToProducts(meal) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify([{
      name: meal.name,
      img: meal.image_url,
      promo_url: meal.cps_link || '',
      category: meal.category
    }]);
    
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/products',
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function syncData() {
  console.log('🔄 开始同步 meals → products...\n');
  
  try {
    // 查询 meals 表
    const meals = await queryMeals();
    console.log(`📊 meals 表：${meals.length} 个商品\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // 同步到 products 表
    for (const meal of meals) {
      if (!meal.is_active) continue;
      
      const result = await insertToProducts(meal);
      
      if (result.statusCode === 200 || result.statusCode === 201) {
        console.log(`✅ ${meal.name} (${meal.category})`);
        successCount++;
      } else {
        console.log(`⚠️  ${meal.name}: ${result.body}`);
        errorCount++;
      }
    }
    
    console.log('\n========================================');
    console.log(`✅ 同步完成！`);
    console.log(`成功：${successCount} 个`);
    console.log(`失败：${errorCount} 个`);
    console.log('========================================\n');
    
    // 验证 products 表
    console.log('🔍 验证 products 表数据...');
    const { execSync } = require('child_process');
    execSync('curl -s "https://isefskqnkeesepcczbyo.supabase.co/rest/v1/products?limit=5" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8" | jq \'.[] | {name, category}\'', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ 同步失败:', error.message);
  }
}

syncData();
