const https = require('https');

const SUPABASE_URL = 'https://isefskqnkeesepcczbyo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

async function removeDuplicates() {
  console.log('===== 商品去重 =====\n');
  
  // 1. 获取所有商品
  const products = await getProducts();
  console.log(`总商品数：${products.length}\n`);
  
  // 2. 查找重复
  const map = new Map();
  const toDelete = [];
  
  products.forEach(p => {
    const key = `${p.category}::${p.name}`;
    if (map.has(key)) {
      // 保留最早的，删除其他的
      const existing = map.get(key);
      if (new Date(p.created_at) > new Date(existing.created_at)) {
        toDelete.push(p.id);
        console.log(`删除重复：${p.category}/${p.name} (${p.created_at})`);
      } else {
        toDelete.push(existing.id);
        console.log(`删除重复：${existing.category}/${existing.name} (${existing.created_at})`);
        map.set(key, p);
      }
    } else {
      map.set(key, p);
    }
  });
  
  console.log(`\n待删除：${toDelete.length} 个`);
  
  // 3. 删除重复
  if (toDelete.length > 0) {
    console.log('\n开始删除...');
    for (const id of toDelete) {
      await deleteProduct(id);
    }
    console.log('✅ 删除完成\n');
  }
  
  // 4. 验证
  const remaining = await getProducts();
  console.log(`剩余商品数：${remaining.length}`);
}

async function getProducts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/products?select=id,name,category,created_at&order=created_at.asc',
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

async function deleteProduct(id) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: `/rest/v1/products?id=eq.${id}`,
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    };
    
    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 204);
    });
    
    req.on('error', reject);
    req.end();
  });
}

removeDuplicates().catch(console.error);
