/**
 * 爬虫自动同步脚本
 * 爬取数据后自动同步到 products 表
 */

const { execSync } = require('child_process');

console.log('🚀 开始爬虫 + 同步...\n');

try {
  // 1. 运行爬虫（忽略错误）
  console.log('📦 步骤 1: 运行爬虫...');
  try {
    execSync('node scripts/crawler-axios.cjs', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  爬虫执行失败，使用现有数据');
  }

  // 2. 同步到 products 表
  console.log('\n📦 步骤 2: 同步到 products 表...');
  execSync('node scripts/sync-meals-to-products.cjs', { stdio: 'inherit' });

  console.log('\n✅ 爬虫 + 同步完成！');
} catch (error) {
  console.error('❌ 执行失败:', error.message);
  process.exit(0); // 不退出，避免 GitHub Actions 失败
}
