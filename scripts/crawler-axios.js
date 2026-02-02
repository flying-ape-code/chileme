#!/usr/bin/env node

/**
 * 美团热门商品爬虫（Axios + Cheerio版本）
 * 用途：爬取美团最新热门商品，更新到 meals-data.json
 * 优势：不需要下载浏览器，安装更快
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

// 配置
const CONFIG = {
  // 数据文件路径
  dataFilePath: path.join(process.cwd(), 'meals-data.json'),
  // 备份路径
  backupPath: path.join(process.cwd(), 'meals-data.json.backup'),
  // 美团热门页面URL（需要确认实际URL）
  meituanUrl: 'https://www.meituan.com/',
  // HTTP请求配置
  axiosConfig: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    timeout: 30000
  },
  // Unsplash图片模板
  imageTemplate: 'https://images.unsplash.com/photo-{id}?w=400&h=400&fit=crop',
  // Unsplash图片ID池
  imageIds: [
    '1619096252214-ef06c45683e3',
    '1625220194771-7ebdea0b70b9',
    '1541696432-82c6da8ce7bf',
    '1526318896980-cf78c088247c',
    '1526777563695-e8467e7c5952',
    '1534422298391-e4f8c170db06',
    '1541832676-9b763b0239ab',
    '1625657101903-3f71b3a0794e',
    '1623341214825-9f4f963727da',
    '1565299587323-8d2b97e4b19',
    '1568901344372-9c0a7b9c4e4',
    '1606492363426-44f8f1eb1c8'
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
 * 注意：需要根据实际页面结构调整
 */
async function crawlMeituanProducts() {
  console.log('🚀 开始爬取美团热门商品...');

  try {
    // 访问美团页面
    console.log(`📍 访问: ${CONFIG.meituanUrl}`);
    const response = await axios.get(CONFIG.meituanUrl, CONFIG.axiosConfig);

    console.log(`📊 状态码: ${response.status}`);
    console.log(`📊 响应大小: ${(response.data.length / 1024).toFixed(2)} KB`);

    // 解析HTML
    const $ = cheerio.load(response.data);

    // 获取页面标题
    const title = $('title').text();
    console.log(`📄 页面标题: ${title}`);

    // TODO: 根据实际页面结构编写爬取逻辑
    // 这里需要分析美团热门商品页面的具体DOM结构

    console.log('⚠️  爬虫框架已创建，需要根据实际页面结构完善爬取逻辑');
    console.log('💡 建议：使用浏览器开发者工具分析目标页面的DOM结构');

    // 示例：提取商品（需要根据实际页面调整）
    // const products = [];
    // $('.product-item').each((index, element) => {
    //   const name = $(element).find('.name').text().trim();
    //   const image = $(element).find('img').attr('src');
    //   const link = $(element).find('a').attr('href');
    //
    //   if (name) {
    //     products.push({
    //       name,
    //       img: image || CONFIG.imageTemplate.replace('{id}', CONFIG.imageIds[index % CONFIG.imageIds.length]),
    //       promoUrl: link || ''
    //     });
    //   }
    // });

    // 返回示例数据（用于测试）
    return {
      breakfast: [
        {
          name: '新爬取商品-煎饼果子',
          img: CONFIG.imageTemplate.replace('{id}', CONFIG.imageIds[0]),
          promoUrl: 'https://i.meituan.com/example1'
        },
        {
          name: '新爬取商品-豆浆',
          img: CONFIG.imageTemplate.replace('{id}', CONFIG.imageIds[1]),
          promoUrl: 'https://i.meituan.com/example2'
        }
      ],
      lunch: [
        {
          name: '新爬取商品-黄焖鸡',
          img: CONFIG.imageTemplate.replace('{id}', CONFIG.imageIds[2]),
          promoUrl: 'https://i.meituan.com/example3'
        }
      ]
    };

  } catch (error) {
    console.error('❌ 爬取失败:', error.message);
    if (error.response) {
      console.error(`❌ 响应状态: ${error.response.status}`);
    }
    return null;
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

  console.log(`📝 已更新类别: ${category}`);
  return updatedData;
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('美团热门商品爬虫（Axios + Cheerio）');
  console.log('========================================');

  // 备份当前数据
  await backupData();

  // 加载当前数据
  const currentData = await loadCurrentData();
  if (!currentData) {
    console.error('❌ 无法加载当前数据，退出');
    process.exit(1);
  }

  console.log(`📊 当前数据类别: ${Object.keys(currentData).join(', ')}`);

  // 爬取新数据
  const newProducts = await crawlMeituanProducts();

  if (newProducts) {
    console.log('✅ 成功爬取数据');

    // 更新数据（这里需要根据实际需求选择更新的类别）
    // 示例：更新所有类别
    const updatedData = { ...currentData, ...newProducts };

    // 保存更新后的数据
    await saveData(updatedData);
    console.log('🎉 数据更新完成！');
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
