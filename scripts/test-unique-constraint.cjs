const https = require('https');

const SUPABASE_URL = 'https://isefskqnkeesepcczbyo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

async function testUniqueConstraint() {
  console.log('===== 测试唯一约束 =====\n');
  
  // 尝试插入重复数据
  console.log('测试：插入重复商品...');
  
  const result = await insertProduct('测试商品', 'breakfast', 'https://example.com/test.jpg');
  
  if (result.success) {
    console.log('❌ 约束未生效（插入成功）');
    // 清理测试数据
    if (result.id) {
      await deleteProduct(result.id);
      console.log('已清理测试数据');
    }
  } else {
    console.log('✅ 约束生效（插入失败）');
    console.log(`错误信息：${result.error}`);
  }
}

async function insertProduct(name, category, img) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ name, category, img });
    
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/products',
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode === 201) {
            resolve({ success: true, id: result[0]?.id });
          } else {
            resolve({ success: false, error: result.message || '插入失败' });
          }
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });
    });
    
    req.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });
    
    req.write(data);
    req.end();
  });
}

async function deleteProduct(id) {
  return new Promise((resolve) => {
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
    
    req.on('error', () => resolve(false));
    req.end();
  });
}

testUniqueConstraint().catch(console.error);
