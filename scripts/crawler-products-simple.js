#!/usr/bin/env node

/**
 * 吃了么 - 商品数据爬虫（简化测试版）
 * 功能：爬取商品数据并保存到 JSON 文件
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 配置
const CONFIG = {
  dataFilePath: path.join(__dirname, '..', 'meals-data.json'),
  categories: ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'],
  mockProducts: {
    breakfast: [
      { name: '煎饼果子', basePrice: 8, rating: 4.5 },
      { name: '小笼包', basePrice: 15, rating: 4.7 },
      { name: '豆浆油条', basePrice: 6, rating: 4.3 },
      { name: '包子粥品', basePrice: 10, rating: 4.4 },
      { name: '鸡蛋灌饼', basePrice: 7, rating: 4.6 },
    ],
    lunch: [
      { name: '黄焖鸡米饭', basePrice: 22, rating: 4.6 },
      { name: '兰州牛肉面', basePrice: 18, rating: 4.5 },
      { name: '麻辣烫', basePrice: 25, rating: 4.4 },
      { name: '盖浇饭', basePrice: 20, rating: 4.3 },
      { name: '炒饭套餐', basePrice: 19, rating: 4.5 },
    ],
    'afternoon-tea': [
      { name: '奶茶', basePrice: 15, rating: 4.7 },
      { name: '蛋糕', basePrice: 28, rating: 4.8 },
      { name: '咖啡', basePrice: 20, rating: 4.6 },
      { name: '水果茶', basePrice: 18, rating: 4.5 },
      { name: '甜点拼盘', basePrice: 35, rating: 4.9 },
    ],
    dinner: [
      { name: '烤鱼', basePrice: 88, rating: 4.7 },
      { name: '火锅', basePrice: 120, rating: 4.8 },
      { name: '烧烤', basePrice: 65, rating: 4.6 },
      { name: '酸菜鱼', basePrice: 75, rating: 4.5 },
      { name: '干锅', basePrice: 68, rating: 4.4 },
    ],
    'night-snack': [
      { name: '小龙虾', basePrice: 98, rating: 4.8 },
      { name: '炒粉', basePrice: 16, rating: 4.3 },
      { name: '烤串', basePrice: 45, rating: 4.6 },
      { name: '卤味', basePrice: 35, rating: 4.5 },
      { name: '砂锅粥', basePrice: 42, rating: 4.7 },
    ],
  },
};

// 生成 CPS 链接
function generateCPSLink(productName, category) {
  const encodedName = encodeURIComponent(productName);
  const timestamp = Date.now();
  return `https://i.meituan.com/cps/${category}/${encodedName}?t=${timestamp}`;
}

// 生成图片 URL
function generateImageUrl(category, index) {
  const photoIds = {
    breakfast: ['1619096252214-ef06c45683e3', '1625220194771-7ebdea0b70b9', '1541696432-82c6da8ce7bf'],
    lunch: ['1565296969296-75e591840652', '1504692545438-ef79a4f73bd4', '1565550513478-8a171993f472'],
    'afternoon-tea': ['1541696432-82c6da8ce7bf', '1572480068859-687271897f5a', '1517701579177-4e49669602cc'],
    dinner: ['1565296969296-75e591840652', '1555932684-02e6fef4f1c3', '1504692545438-ef79a4f73bd4'],
    'night-snack': ['1555932684-02e6fef4f1c3', '1565550513478-8a171993f472', '1504692545438-ef79a4f73bd4'],
  };
  
  const ids = photoIds[category] || photoIds.lunch;
  return `https://images.unsplash.com/photo-${ids[index % ids.length]}?w=400&h=300&fit=crop`;
}

// 主函数
async function main() {
  console.log('========================================');
  console.log('吃了么 - 商品数据爬虫（测试版）');
  console.log('========================================\n');
  
  const products = {};
  
  for (const category of CONFIG.categories) {
    const mockItems = CONFIG.mockProducts[category] || [];
    products[category] = [];
    
    console.log(`处理分类：${category}`);
    
    for (let i = 0; i < mockItems.length; i++) {
      const item = mockItems[i];
      const product = {
        name: item.name,
        img: generateImageUrl(category, i),
        promoUrl: generateCPSLink(item.name, category),
        cpsLink: generateCPSLink(item.name, category),
        category,
        priceMin: item.basePrice * 0.9,
        priceMax: item.basePrice * 1.1,
        rating: item.rating,
        platform: 'meituan',
        crawledAt: new Date().toISOString(),
      };
      
      products[category].push(product);
      console.log(`  ✓ ${product.name}`);
    }
  }
  
  // 保存到 JSON 文件
  const simplifiedData = {};
  for (const [category, items] of Object.entries(products)) {
    simplifiedData[category] = items.map(item => ({
      name: item.name,
      img: item.img,
      promoUrl: item.cpsLink,
      crawledAt: item.crawledAt,
    }));
  }
  
  await fs.writeFile(CONFIG.dataFilePath, JSON.stringify(simplifiedData, null, 2), 'utf-8');
  
  console.log('\n========================================');
  console.log(`✅ 爬虫完成！数据已保存到：${CONFIG.dataFilePath}`);
  const totalCount = Object.values(simplifiedData).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`总计：${totalCount} 个商品`);
  console.log('========================================');
}

main();
