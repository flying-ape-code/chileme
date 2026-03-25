const https = require('https');

const SUPABASE_URL = 'https://isefskqnkeesepcczbyo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

async function addUniqueConstraint() {
  console.log('===== 添加唯一约束 =====\n');
  
  const sql = `
    -- 添加 category + name 组合唯一约束
    ALTER TABLE products 
    ADD CONSTRAINT unique_category_name 
    UNIQUE (category, name);
  `;
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ sql });
    
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/rpc',
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          console.log('✅ 唯一约束添加成功\n');
          resolve(true);
        } else {
          console.log('❌ 唯一约束添加失败');
          console.log(`HTTP ${res.statusCode}: ${body}\n`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (e) => {
      console.log('❌ 请求错误:', e.message);
      resolve(false);
    });
    
    req.write(data);
    req.end();
  });
}

addUniqueConstraint().catch(console.error);
