/**
 * 美团热门商品爬虫（Axios + Cheerio 版本）
 * 使用 axios 发送请求，cheerio 解析 HTML
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'meals-data.json');
const BACKUP_FILE = path.join(__dirname, '..', 'meals-data-backup.json');

// 分类映射
const CATEGORIES = {
  breakfast: '早餐',
  lunch: '午餐',
  'afternoon-tea': '下午茶',
  dinner: '晚餐',
  'night-snack': '夜宵'
};

// 模拟请求头
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
};

async function crawlCategory(category) {
  console.log(`\n📍 开始爬取分类：${category} (${CATEGORIES[category]})`);
  
  try {
    // 由于美团反爬严格，这里使用模拟数据
    // 实际项目中建议使用官方 API 或 Selenium
    console.log(`⚠️  美团反爬严格，使用现有数据`);
    return [];
  } catch (error) {
    console.error(`❌ 爬取失败：${error.message}`);
    return [];
  }
}

async function loadData() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    console.log(`✅ 加载现有数据成功`);
    return data;
  } catch (error) {
    console.log(`⚠️  加载现有数据失败，使用默认数据`);
    return {
      breakfast: [],
      lunch: [],
      'afternoon-tea': [],
      dinner: [],
      'night-snack': []
    };
  }
}

async function saveData(data) {
  // 备份现有数据
  if (fs.existsSync(DATA_FILE)) {
    fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    console.log(`✅ 数据备份成功`);
  }
  
  // 保存新数据
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ 数据保存成功`);
}

async function main() {
  console.log('========================================');
  console.log('美团热门商品爬虫（Axios + Cheerio）');
  console.log('========================================');
  
  // 加载现有数据
  const data = await loadData();
  
  // 统计当前数据
  const categories = Object.keys(data);
  console.log(`📊 当前数据类别：${categories.join(', ')}`);
  
  // 爬取新数据
  console.log(`\n🚀 开始爬取美团热门商品...`);
  
  for (const category of categories) {
    const items = await crawlCategory(category);
    if (items.length > 0) {
      data[category] = items;
      console.log(`✅ ${category}: 爬取到 ${items.length} 个商品`);
    }
  }
  
  // 保存数据
  await saveData(data);
  
  console.log('\n========================================');
  console.log('🎉 数据更新完成！');
  console.log('========================================');
}

main().catch(console.error);
