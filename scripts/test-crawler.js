#!/usr/bin/env node

/**
 * 美团热门商品爬虫 - 测试版本
 * 用途：分析美团页面结构，测试爬取逻辑
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

// 配置
const CONFIG = {
  meituanUrl: 'https://www.meituan.com/',
  axiosConfig: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
    timeout: 30000
  }
};

/**
 * 测试爬取美团首页
 */
async function testMeituanCrawl() {
  console.log('========================================');
  console.log('美团页面结构分析测试');
  console.log('========================================');

  try {
    console.log(`📍 访问: ${CONFIG.meituanUrl}`);
    const response = await axios.get(CONFIG.meituanUrl, CONFIG.axiosConfig);

    console.log(`✅ 请求成功`);
    console.log(`📊 状态码: ${response.status}`);
    console.log(`📊 响应大小: ${(response.data.length / 1024).toFixed(2)} KB`);

    // 解析HTML
    const $ = cheerio.load(response.data);

    // 获取基本信息
    const title = $('title').text();
    console.log(`\n📄 页面标题: ${title}`);

    // 查找商品链接（尝试不同的选择器）
    console.log(`\n🔍 查找商品链接...`);

    // 查找所有a标签
    const allLinks = $('a[href*="meituan.com"]').length;
    console.log(`   找到美团链接: ${allLinks} 个`);

    // 查找可能包含商品的class
    console.log(`\n🔍 查找可能包含商品的元素...`);

    const productClasses = [
      '.product-item',
      '.item',
      '.card',
      '.goods',
      '.food-item',
      '[data-product]'
    ];

    productClasses.forEach(className => {
      const count = $(className).length;
      if (count > 0) {
        console.log(`   ${className}: ${count} 个`);
      }
    });

    // 查找图片
    const images = $('img').length;
    console.log(`\n🖼️  图片数量: ${images}`);

    // 查找所有链接
    console.log(`\n🔗 示例链接（前10个）:`);
    $('a[href*="meituan.com"]').slice(0, 10).each((index, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim().substring(0, 30);
      if (href) {
        console.log(`   ${index + 1}. ${text} -> ${href.substring(0, 50)}...`);
      }
    });

    console.log(`\n✅ 分析完成`);
    console.log(`💡 下一步：根据实际页面结构调整爬虫逻辑`);

  } catch (error) {
    console.error(`❌ 错误:`, error.message);
    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
    }
  }

  console.log('========================================');
}

// 执行测试
testMeituanCrawl();
