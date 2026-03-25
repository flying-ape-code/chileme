const https = require('https');

const products = [
  { id: '7f34dc08-85e2-4f31-9a07-c62da301264f', name: '奶茶' },
  { id: '9e7ad0a4-a14b-40d6-ab50-e0ad620f0e6c', name: '咖啡' },
  { id: '237afd8f-18c4-41ba-bef5-af5ffa4f9eb4', name: '火锅' }
];

async function testCPSLink(product) {
  const cpsUrl = `https://u.meituan.com/cps/promotion?position_id=shipinwaimai&goods_id=${product.id}&channel_id=473920`;
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'u.meituan.com',
      port: 443,
      path: '/cps/promotion?position_id=shipinwaimai&goods_id=' + product.id + '&channel_id=473920',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };
    
    const req = https.request(options, (res) => {
      resolve({
        name: product.name,
        status: res.statusCode,
        redirect: res.headers.location || '无跳转'
      });
    });
    
    req.on('error', (e) => {
      resolve({
        name: product.name,
        status: 0,
        error: e.message
      });
    });
    
    req.end();
  });
}

async function main() {
  console.log('测试 CPS 链接...\n');
  
  for (const product of products) {
    const result = await testCPSLink(product);
    console.log(`${result.name}: ${result.status === 200 ? '✅' : '❌'} HTTP ${result.status}`);
    if (result.redirect) console.log(`  跳转：${result.redirect}`);
    if (result.error) console.log(`  错误：${result.error}`);
  }
}

main().catch(console.error);
