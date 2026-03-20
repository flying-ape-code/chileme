/**
 * 爬虫自动同步脚本
 * 爬取数据后自动同步到 products 表
 */

const { execSync } = require('child_process');

console.log('🚀 开始爬虫 + 同步...\n');

// 1. 运行爬虫
console.log('📦 步骤 1: 运行爬虫...');
execSync('node scripts/crawler-axios.cjs', { stdio: 'inherit' });

// 2. 同步到 products 表
console.log('\n📦 步骤 2: 同步到 products 表...');
execSync('node scripts/sync-meals-to-products.cjs', { stdio: 'inherit' });

console.log('\n✅ 爬虫 + 同步完成！');
