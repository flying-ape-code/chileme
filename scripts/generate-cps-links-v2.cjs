const https = require('https');

// 订单侠 API 配置
const API_KEY = 'Ww9xkFpD8lfGswr4UleNjsQoxMHyeiWR';
const POSITION_ID = 'shipinwaimai';
const CHANNEL_ID = '473920';

// 美团联盟官方推广位（不需要真实商品 ID）
// 使用推广位链接格式
function generateMeituanCPSLink() {
  // 美团联盟 CPS 链接格式（推广位）
  return `https://u.meituan.com/cps/promotion?position_id=${POSITION_ID}&channel_id=${CHANNEL_ID}`;
}

// 测试链接
async function testLink() {
  const cpsUrl = generateMeituanCPSLink();
  console.log('CPS 推广链接:', cpsUrl);
  
  return new Promise((resolve) => {
    const url = new URL(cpsUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log('HTTP 状态:', res.statusCode);
      console.log('跳转 URL:', res.headers.location || '无跳转');
      resolve(res.statusCode);
    });
    
    req.on('error', (e) => {
      console.error('请求错误:', e.message);
      resolve(0);
    });
    
    req.end();
  });
}

testLink().then(code => {
  console.log('\n测试结果:', code === 200 || code === 302 ? '✅ 成功' : '❌ 失败 (HTTP ' + code + ')');
  console.log('\n建议: 使用美团联盟官方推广位链接，不需要商品 ID');
}).catch(console.error);
