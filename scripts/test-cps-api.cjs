/**
 * 测试订单侠 API
 */

const https = require('https');

const API_KEY = 'Ww9xkFpD8lfGswr4UleNjsQoxMHyeiWR';

console.log('🔍 测试订单侠 API 连接...\n');

const postData = JSON.stringify({
  apikey: API_KEY,
  type: 'meituan'
});

const options = {
  hostname: 'api.dingdanxia.com',
  port: 443,
  path: '/api/test',
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
    console.log('API 响应状态:', res.statusCode);
    console.log('API 响应内容:', body);
    
    try {
      const result = JSON.parse(body);
      if (result.code === 200) {
        console.log('\n✅ API Key 有效！');
      } else {
        console.log('\n❌ API Key 无效:', result.message);
      }
    } catch (e) {
      console.log('\n⚠️  响应格式异常');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 请求失败:', e.message);
});

req.write(postData);
req.end();
