const https = require('https');

console.log('测试 CPS 链接（带完整 headers）...\n');

const url = 'https://u.meituan.com/cps/promotion?position_id=shipinwaimai&channel_id=473920';
const urlObj = new URL(url);

const options = {
  hostname: urlObj.hostname,
  port: 443,
  path: urlObj.pathname + urlObj.search,
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Connection': 'close'
  }
};

const req = https.request(options, (res) => {
  console.log('HTTP 状态:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('跳转 URL:', res.headers.location || '无跳转');
  console.log('\n完整 Headers:');
  console.log(res.headers);
});

req.on('error', (e) => {
  console.error('请求错误:', e.message);
});

req.end();
