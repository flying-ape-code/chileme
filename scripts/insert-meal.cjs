const https = require('https');

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

function insertMeal(meal) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify([meal]);
    
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/meals',
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(body));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 测试插入商品...');
  
  const testMeal = {
    name: '测试商品-' + Date.now(),
    category: 'breakfast',
    image_url: 'https://example.com/test.jpg',
    is_active: true
  };
  
  try {
    const result = await insertMeal(testMeal);
    console.log('✅ 插入成功:', result);
  } catch (error) {
    console.error('❌ 插入失败:', error.message);
  }
}

main();
