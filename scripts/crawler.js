#!/usr/bin/env node

/**
 * 美团热门商品爬虫
 * 用途：爬取美团最新热门商品，更新到 meals-data.json
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

// 配置
const CONFIG = {
  // 数据文件路径
  dataFilePath: path.join(process.cwd(), 'meals-data.json'),
  // 备份路径
  backupPath: path.join(process.cwd(), 'meals-data.json.backup'),
  // 类别映射
  categoryMapping: {
    'breakfast': 'breakfast',
    'lunch': 'lunch',
    'dinner': 'dinner',
    'snack': 'night-snack',
    'drink': 'afternoon-tea'
  },
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
 * 爬取美团热门商品
 * 注意：这是一个基础框架，需要根据实际页面结构调整
 */
async function crawlMeituanProducts() {
  console.log('🚀 开始爬取美团热门商品...');

  let browser = null;

  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();

    // 设置用户代理
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // 访问美团首页
    console.log('📍 访问美团首页...');
    await page.goto('https://www.meituan.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 获取页面标题
    const title = await page.title();
    console.log('📄 页面标题:', title);

    // TODO: 根据实际页面结构编写爬取逻辑
    // 这里需要分析美团热门商品页面的具体URL和DOM结构

    console.log('⚠️  爬虫框架已创建，需要根据实际页面结构完善爬取逻辑');
    console.log('💡 建议：使用浏览器开发者工具分析目标页面的DOM结构');

    // 返回示例数据（用于测试）
    return {
      breakfast: [
        {
          name: '新爬取商品1',
          img: CONFIG.imageTemplate.replace('{id}', CONFIG.imageIds[0]),
          promoUrl: 'https://i.meituan.com/example1'
        }
      ],
      lunch: [
        {
          name: '新爬取商品2',
          img: CONFIG.imageTemplate.replace('{id}', CONFIG.imageIds[1]),
          promoUrl: 'https://i.meituan.com/example2'
        }
      ]
    };

  } catch (error) {
    console.error('❌ 爬取失败:', error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 更新商品数据
 * 策略：保留现有数据，只更新指定类别
 */
function updateMealsData(currentData, newProducts, category) {
  if (!currentData) {
    console.error('❌ 当前数据为空');
    return null;
  }

  // 更新指定类别的商品
  const updatedData = {
    ...currentData,
    [category]: newProducts
  };

  return updatedData;
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('美团热门商品爬虫');
  console.log('========================================');

  // 备份当前数据
  await backupData();

  // 加载当前数据
  const currentData = await loadCurrentData();
  if (!currentData) {
    console.error('❌ 无法加载当前数据，退出');
    process.exit(1);
  }

  console.log('📊 当前数据类别:', Object.keys(currentData).join(', '));

  // 爬取新数据
  const newProducts = await crawlMeituanProducts();

  if (newProducts) {
    console.log('✅ 成功爬取数据');

    // 更新数据（这里需要根据实际需求选择更新的类别）
    const updatedData = updateMealsData(currentData, newProducts, 'breakfast');

    if (updatedData) {
      // 保存更新后的数据
      await saveData(updatedData);
      console.log('🎉 数据更新完成！');
    }
  } else {
    console.log('❌ 爬取失败，数据未更新');
  }

  console.log('========================================');
  console.log('执行完成');
}

// 执行主函数
main().catch(error => {
  console.error('❌ 程序异常:', error);
  process.exit(1);
});
