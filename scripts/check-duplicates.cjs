const https = require('https');

const SUPABASE_URL = 'https://isefskqnkeesepcczbyo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

async function checkDuplicates() {
  console.log('检查重复商品...\n');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/products?select=name,category,created_at&order=created_at.asc',
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
          const products = JSON.parse(body);
          
          // 查找重复
          const map = new Map();
          const duplicates = [];
          
          products.forEach(p => {
            const key = `${p.category}::${p.name}`;
            if (map.has(key)) {
              duplicates.push({
                name: p.name,
                category: p.category,
                created_at: p.created_at,
                isDuplicate: true
              });
            } else {
              map.set(key, p);
            }
          });
          
          console.log(`总商品数：${products.length}`);
          console.log(`重复商品数：${duplicates.length}\n`);
          
          if (duplicates.length > 0) {
            console.log('重复商品列表:');
            duplicates.forEach(d => {
              console.log(`  - ${d.category}/${d.name} (${d.created_at})`);
            });
          }
          
          resolve({ products, duplicates });
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

checkDuplicates().catch(console.error);
