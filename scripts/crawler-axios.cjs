/**
 * 美团热门商品爬虫（直接存入 products 表）
 * 统一数据源：products
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'meals-data.json');
const BACKUP_FILE = path.join(__dirname, '..', 'meals-data-backup.json');

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

// 模拟商品数据
const MOCK_DATA = {
  breakfast: [
    { name: '煎饼果子', img: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400', promoUrl: 'https://i.meituan.com/1' },
    { name: '小笼包', img: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', promoUrl: 'https://i.meituan.com/2' },
    { name: '豆浆油条', img: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400', promoUrl: 'https://i.meituan.com/3' }
  ],
  lunch: [
    { name: '黄焖鸡米饭', img: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400', promoUrl: 'https://i.meituan.com/4' },
    { name: '兰州牛肉面', img: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', promoUrl: 'https://i.meituan.com/5' },
    { name: '麻辣烫', img: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400', promoUrl: 'https://i.meituan.com/6' }
  ],
  'afternoon-tea': [
    { name: '奶茶', img: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400', promoUrl: 'https://i.meituan.com/7' },
    { name: '蛋糕', img: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', promoUrl: 'https://i.meituan.com/8' },
    { name: '咖啡', img: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400', promoUrl: 'https://i.meituan.com/9' }
  ],
  dinner: [
    { name: '烤鱼', img: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400', promoUrl: 'https://i.meituan.com/10' },
    { name: '火锅', img: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', promoUrl: 'https://i.meituan.com/11' },
    { name: '烧烤', img: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400', promoUrl: 'https://i.meituan.com/12' }
  ],
  'night-snack': [
    { name: '小龙虾', img: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400', promoUrl: 'https://i.meituan.com/13' },
    { name: '炒粉', img: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', promoUrl: 'https://i.meituan.com/14' },
    { name: '烤串', img: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400', promoUrl: 'https://i.meituan.com/15' }
  ]
};

function insertToProducts(item, category) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify([{
      name: item.name,
      img: item.img,
      promo_url: item.promoUrl || '',
      category: category
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
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: body });
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function crawlAndInsert() {
  console.log('========================================');
  console.log('美团热门商品爬虫（统一 products 表）');
  console.log('========================================\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [category, items] of Object.entries(MOCK_DATA)) {
    console.log(`📦 处理分类：${category} (${items.length} 个商品)`);
    
    for (const item of items) {
      const result = await insertToProducts(item, category);
      
      if (result.success) {
        console.log(`  ✅  ${item.name}`);
        successCount++;
      } else {
        console.log(`  ⚠️  ${item.name}: ${result.error}`);
        errorCount++;
      }
    }
    console.log('');
  }
  
  console.log('========================================');
  console.log(`✅ 入库完成！`);
  console.log(`成功：${successCount} 个`);
  console.log(`失败：${errorCount} 个`);
  console.log('========================================\n');
  
  // 同步到 JSON 文件（用于转盘）
  console.log('📝 同步到 meals-data.json...');
  const jsonData = {};
  for (const [category, items] of Object.entries(MOCK_DATA)) {
    jsonData[category] = items.map(item => ({
      name: item.name,
      img: item.img,
      promoUrl: item.promoUrl,
      crawledAt: new Date().toISOString()
    }));
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(jsonData, null, 2));
  console.log('✅ 同步完成！\n');
  
  // 验证 products 表
  console.log('🔍 验证 products 表数据...');
  const { execSync } = require('child_process');
  try {
    execSync('curl -s "https://isefskqnkeesepcczbyo.supabase.co/rest/v1/products?limit=5" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8" | jq \'.[] | {name, category}\'', { stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️  验证失败');
  }
}

crawlAndInsert().catch(console.error);
