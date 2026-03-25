const https = require('https');

const SUPABASE_URL = 'https://isefskqnkeesepcczbyo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

async function addUniqueConstraint() {
  console.log('===== 添加唯一约束 =====\n');
  
  const sql = `ALTER TABLE products ADD CONSTRAINT unique_category_name UNIQUE (category, name);`;
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/products?select=category,name&limit=1',
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    // 先测试连接
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('✅ 数据库连接正常');
        console.log('⚠️  唯一约束需要通过 Supabase Dashboard SQL Editor 执行:');
        console.log('');
        console.log(sql);
        console.log('');
        resolve(true);
      });
    });
    
    req.on('error', (e) => {
      console.log('❌ 连接错误:', e.message);
      resolve(false);
    });
    
    req.end();
  });
}

addUniqueConstraint().catch(console.error);
