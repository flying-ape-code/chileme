/**
 * CPS 链接验证脚本
 * 实际测试 CPS 链接是否有效
 */

const https = require('https');

/**
 * 测试 URL 是否可达
 */
function testUrl(url) {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(url).hostname,
      port: 443,
      path: new URL(url).pathname + new URL(url).search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      resolve({
        statusCode: res.statusCode,
        redirectUrl: res.headers.location || null,
        valid: res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302
      });
    });

    req.on('error', (e) => {
      resolve({
        statusCode: 0,
        redirectUrl: null,
        valid: false,
        error: e.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 0,
        redirectUrl: null,
        valid: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

/**
 * 获取 CPS 链接样本
 */
async function getCpsSamples() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/products?select=id,name,category,cps_link&limit=10',
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8'
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

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始验证 CPS 链接...\n');
  
  const products = await getCpsSamples();
  
  console.log(`📦 抽取 ${products.length} 个 CPS 链接样本\n`);
  
  const results = [];
  
  for (const product of products) {
    if (!product.cps_link) {
      console.log(`⏭️  ${product.name}: 无 CPS 链接`);
      results.push({
        name: product.name,
        category: product.category,
        cps_link: null,
        valid: false,
        reason: '无 CPS 链接'
      });
      continue;
    }
    
    console.log(`🔗 测试：${product.name}`);
    console.log(`   CPS: ${product.cps_link}`);
    
    const result = await testUrl(product.cps_link);
    
    if (result.valid) {
      console.log(`   ✅ 有效 (HTTP ${result.statusCode})`);
      if (result.redirectUrl) {
        console.log(`   🔄 跳转到：${result.redirectUrl}`);
      }
      results.push({
        name: product.name,
        category: product.category,
        cps_link: product.cps_link,
        valid: true,
        statusCode: result.statusCode,
        redirectUrl: result.redirectUrl
      });
    } else {
      console.log(`   ❌ 无效：${result.error || 'HTTP ' + result.statusCode}`);
      results.push({
        name: product.name,
        category: product.category,
        cps_link: product.cps_link,
        valid: false,
        error: result.error || 'HTTP ' + result.statusCode
      });
    }
    console.log();
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 统计
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.filter(r => !r.valid).length;
  const nullCount = results.filter(r => r.cps_link === null).length;
  
  console.log('========================================');
  console.log('📊 验证结果统计:');
  console.log(`✅ 有效：${validCount} 个 (${(validCount / results.length * 100).toFixed(1)}%)`);
  console.log(`❌ 无效：${invalidCount} 个 (${(invalidCount / results.length * 100).toFixed(1)}%)`);
  console.log(`⏭️  无链接：${nullCount} 个`);
  console.log('========================================\n');
  
  // 生成报告
  const report = `# CPS 链接验证报告

**测试时间:** ${new Date().toLocaleString('zh-CN')}
**样本数量:** ${results.length} 个

## 📊 统计结果

- ✅ 有效：${validCount} 个 (${(validCount / results.length * 100).toFixed(1)}%)
- ❌ 无效：${invalidCount} 个 (${(invalidCount / results.length * 100).toFixed(1)}%)
- ⏭️  无链接：${nullCount} 个

## 🔍 详细结果

${results.map((r, i) => `### ${i + 1}. ${r.name} (${r.category})

**CPS 链接:** ${r.cps_link || '无'}
**状态:** ${r.valid ? '✅ 有效' : '❌ 无效'}
${r.valid ? `**HTTP 状态:** ${r.statusCode}` : ''}
${r.redirectUrl ? `**跳转链接:** ${r.redirectUrl}` : ''}
${!r.valid && r.error ? `**错误:** ${r.error}` : ''}
`).join('\n')}

## 💡 结论和建议

${validCount > invalidCount ? 
'✅ CPS 链接整体有效，可以正常使用' : 
'❌ CPS 链接存在大量无效链接，需要重新生成'}

---

**报告生成时间:** ${new Date().toISOString()}
`;
  
  // 保存报告
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '..', 'test-reports', 'existing-cps-verification.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`📄 报告已保存到：${reportPath}\n`);
}

main().catch(console.error);
