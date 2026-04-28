#!/usr/bin/env node

/**
 * 美团热门商品爬虫 - 配置版本
 * 用途：从配置文件加载商品数据，支持手动管理
 * 说明：由于美团外卖需要登录且反爬严格，本方案采用手动维护数据的方式
 */

import fs from 'fs/promises';
import path from 'path';

// 配置
const CONFIG = {
  // 数据文件路径
  dataFilePath: path.join(process.cwd(), 'meals-data.json'),
  // 备份路径
  backupPath: path.join(process.cwd(), 'meals-data.json.backup'),
  // 配置文件路径
  configPath: path.join(process.cwd(), 'crawler-config.json'),
  // Unsplash图片模板
  imageTemplate: 'https://images.unsplash.com/photo-{id}?w=400&h=400&fit=crop',
  // Unsplash图片ID池
  imageIds: [
    '1619096252214-ef06c45683e3', // 煎饼果子
    '1625220194771-7ebdea0b70b9', // 皮蛋瘦肉粥
    '1541696432-82c6da8ce7bf', // 小笼包
    '1526318896980-cf78c088247c', // 小馄饨
    '1526777563695-e8467e7c5952', // 热干面
    '1534422298391-e4f8c170db06', // 生煎包
    '1541832676-9b763b0239ab', // 黄焖鸡米饭
    '1625657101903-3f71b3a0794e', // 兰州牛肉面
    '1623341214825-9f4f963727da', // 麻辣香锅
    '1565299587323-8d2b97e4b19', // 宫保鸡丁
    '1568901344372-9c0a7b9c4e4', // 红烧肉
    '1606492363426-44f8f1eb1c8', // 烤鱼
  ]
};

/**
 * 备份当前数据
 */
async function backupData() {
  try {
    const data = await fs.readFile(CONFIG.dataFilePath, 'utf8');
    await fs.writeFile(CONFIG.backupPath, data);
    console.log('✅ 数据备份成功');
    return true;
  } catch (error) {
    console.error('❌ 数据备份失败:', error.message);
    return false;
  }
}

/**
 * 加载当前数据
 */
async function loadCurrentData() {
  try {
    const data = await fs.readFile(CONFIG.dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 加载数据失败:', error.message);
    return null;
  }
}

/**
 * 加载爬虫配置
 */
async function loadCrawlerConfig() {
  try {
    const data = await fs.readFile(CONFIG.configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // 如果配置文件不存在，返回默认配置
    console.log('📝 配置文件不存在，使用默认配置');
    return {
      enabled: true,
      autoUpdate: false,
      categories: ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'],
      updateInterval: '0 * * * *' // 每小时
    };
  }
}

/**
 * 保存数据
 */
async function saveData(data) {
  try {
    await fs.writeFile(
      CONFIG.dataFilePath,
      JSON.stringify(data, null, 2),
      'utf8'
    );
    console.log('✅ 数据保存成功');
    return true;
  } catch (error) {
    console.error('❌ 数据保存失败:', error.message);
    return false;
  }
}

/**
 * 生成模拟商品数据
 * 说明：用于测试和演示，实际使用时应该替换为真实爬取的数据
 */
function generateMockProducts(category, count = 6) {
  const products = [];

  const categoryNames = {
    'breakfast': ['煎饼果子', '小笼包', '豆浆', '油条', '皮蛋瘦肉粥', '烧麦'],
    'lunch': ['黄焖鸡米饭', '兰州牛肉面', '麻辣烫', '盖浇饭', '木桶饭', '煲仔饭'],
    'afternoon-tea': ['奶茶', '水果茶', '蛋糕', '三明治', '沙拉', '咖啡'],
    'dinner': ['烤鱼', '火锅', '烧烤', '炸鸡', '麻辣香锅', '水煮鱼'],
    'night-snack': ['烧烤', '小龙虾', '炒粉', '关东煮', '烤串', '炸鸡块']
  };

  const categoryProducts = categoryNames[category] || categoryNames['lunch'];

  for (let i = 0; i < count; i++) {
    const name = categoryProducts[i % categoryProducts.length];
    products.push({
      name: name,
      img: CONFIG.imageTemplate.replace('{id}', CONFIG.imageIds[i % CONFIG.imageIds.length]),
      promoUrl: `https://i.meituan.com/${category}/${name}`,
      crawledAt: new Date().toISOString()
    });
  }

  return products;
}

/**
 * 更新商品数据
 */
async function updateMealsData(currentData, category, products) {
  if (!currentData) {
    console.error('❌ 当前数据为空');
    return null;
  }

  const updatedData = {
    ...currentData,
    [category]: products
  };

  console.log(`📝 已更新类别: ${category}`);
  console.log(`📦 新商品数量: ${products.length}`);

  return updatedData;
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('美团热门商品爬虫 - 配置版');
  console.log('========================================');

  // 加载配置
  const crawlerConfig = await loadCrawlerConfig();
  console.log(`📝 爬虫配置:`);
  console.log(`   启用: ${crawlerConfig.enabled}`);
  console.log(`   自动更新: ${crawlerConfig.autoUpdate}`);
  console.log(`   更新类别: ${crawlerConfig.categories.join(', ')}`);

  if (!crawlerConfig.enabled) {
    console.log('⚠️  爬虫已禁用，退出');
    process.exit(0);
  }

  // 备份当前数据
  await backupData();

  // 加载当前数据
  const currentData = await loadCurrentData();
  if (!currentData) {
    console.error('❌ 无法加载当前数据，退出');
    process.exit(1);
  }

  console.log(`📊 当前数据类别: ${Object.keys(currentData).join(', ')}`);

  // 模拟爬取数据（实际应用中应该替换为真实爬取逻辑）
  console.log('🚀 开始爬取/生成商品数据...');

  // 为每个类别生成/爬取数据
  let updatedData = { ...currentData };

  for (const category of crawlerConfig.categories) {
    console.log(`\n📍 处理类别: ${category}`);

    // 这里调用实际爬虫，暂时使用模拟数据
    // const products = await crawlMeituanProducts(category);
    const products = generateMockProducts(category, 6);

    updatedData = await updateMealsData(updatedData, category, products);
  }

  // 保存更新后的数据
  if (updatedData) {
    await saveData(updatedData);
    console.log('\n🎉 所有类别数据更新完成！');
  } else {
    console.log('\n❌ 数据更新失败');
  }

  console.log('========================================');
  console.log('执行完成');
}

// 执行主函数
main().catch(error => {
  console.error('❌ 程序异常:', error);
  process.exit(1);
});
