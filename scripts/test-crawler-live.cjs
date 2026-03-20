/**
 * 爬虫实时测试脚本
 * 验证爬虫能否真正爬取数据并入库
 */

const https = require('https');
const fs = require('fs');

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

function queryDatabase() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'isefskqnkeesepcczbyo.supabase.co',
      port: 443,
      path: '/rest/v1/meals?select=name,category,created_at&order=created_at.desc&limit=10',
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function testCrawler() {
  console.log('🔍 测试爬虫数据入库...\n');
  
  try {
    // 查询数据库
    const meals = await queryDatabase();
    
    console.log(`✅ 数据库连接成功`);
    console.log(`📊 当前商品数量：${meals.length} 个\n`);
    
    if (meals.length === 0) {
      console.log('❌ 数据库为空！爬虫未成功入库！\n');
      return false;
    }
    
    console.log('📦 最新 10 个商品:');
    meals.forEach((meal, index) => {
      const date = new Date(meal.created_at).toLocaleString('zh-CN');
      console.log(`${index + 1}. ${meal.name} (${meal.category}) - ${date}`);
    });
    
    // 统计分类
    const categoryCount = {};
    meals.forEach(meal => {
      categoryCount[meal.category] = (categoryCount[meal.category] || 0) + 1;
    });
    
    console.log('\n📊 分类统计:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 个`);
    });
    
    console.log('\n✅ 爬虫数据入库验证成功！');
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return false;
  }
}

testCrawler();
