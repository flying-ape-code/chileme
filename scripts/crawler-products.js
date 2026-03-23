#!/usr/bin/env node

/**
 * 吃了么 - 商品数据爬虫
 * 功能：从美团/饿了么爬取商品数据，生成 CPS 链接，存入数据库
 * 
 * 使用方式：
 *   node scripts/crawler-products.js
 *   node scripts/crawler-products.js --platform meituan
 *   node scripts/crawler-products.js --full  # 全量更新
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// 配置
const CONFIG = {
  // 数据文件路径
  dataFilePath: path.join(__dirname, '..', 'meals-data.json'),
  // 备份路径
  backupPath: path.join(__dirname, '..', 'meals-data.json.backup'),
  // 日志配置
  logFile: path.join(__dirname, '..', 'logs', `crawler-${new Date().toISOString().split('T')[0]}.log`),
  // 分类配置
  categories: ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'],
  // 模拟商品数据（用于演示，实际应从 API 获取）
  mockProducts: {
    breakfast: [
      { name: '煎饼果子', basePrice: 8, rating: 4.5, distance: '500m', deliveryTime: '20min' },
      { name: '小笼包', basePrice: 15, rating: 4.7, distance: '1.2km', deliveryTime: '25min' },
      { name: '豆浆油条', basePrice: 6, rating: 4.3, distance: '300m', deliveryTime: '15min' },
      { name: '包子粥品', basePrice: 10, rating: 4.4, distance: '800m', deliveryTime: '20min' },
      { name: '鸡蛋灌饼', basePrice: 7, rating: 4.6, distance: '600m', deliveryTime: '18min' },
    ],
    lunch: [
      { name: '黄焖鸡米饭', basePrice: 22, rating: 4.6, distance: '1.5km', deliveryTime: '30min' },
      { name: '兰州牛肉面', basePrice: 18, rating: 4.5, distance: '900m', deliveryTime: '25min' },
      { name: '麻辣烫', basePrice: 25, rating: 4.4, distance: '1.1km', deliveryTime: '28min' },
      { name: '盖浇饭', basePrice: 20, rating: 4.3, distance: '700m', deliveryTime: '22min' },
      { name: '炒饭套餐', basePrice: 19, rating: 4.5, distance: '1.0km', deliveryTime: '26min' },
    ],
    'afternoon-tea': [
      { name: '奶茶', basePrice: 15, rating: 4.7, distance: '400m', deliveryTime: '15min' },
      { name: '蛋糕', basePrice: 28, rating: 4.8, distance: '1.3km', deliveryTime: '35min' },
      { name: '咖啡', basePrice: 20, rating: 4.6, distance: '500m', deliveryTime: '18min' },
      { name: '水果茶', basePrice: 18, rating: 4.5, distance: '600m', deliveryTime: '20min' },
      { name: '甜点拼盘', basePrice: 35, rating: 4.9, distance: '1.5km', deliveryTime: '40min' },
    ],
    dinner: [
      { name: '烤鱼', basePrice: 88, rating: 4.7, distance: '2.0km', deliveryTime: '45min' },
      { name: '火锅', basePrice: 120, rating: 4.8, distance: '1.8km', deliveryTime: '50min' },
      { name: '烧烤', basePrice: 65, rating: 4.6, distance: '1.2km', deliveryTime: '35min' },
      { name: '酸菜鱼', basePrice: 75, rating: 4.5, distance: '1.5km', deliveryTime: '40min' },
      { name: '干锅', basePrice: 68, rating: 4.4, distance: '1.3km', deliveryTime: '38min' },
    ],
    'night-snack': [
      { name: '小龙虾', basePrice: 98, rating: 4.8, distance: '2.5km', deliveryTime: '50min' },
      { name: '炒粉', basePrice: 16, rating: 4.3, distance: '800m', deliveryTime: '25min' },
      { name: '烤串', basePrice: 45, rating: 4.6, distance: '1.0km', deliveryTime: '30min' },
      { name: '卤味', basePrice: 35, rating: 4.5, distance: '900m', deliveryTime: '28min' },
      { name: '砂锅粥', basePrice: 42, rating: 4.7, distance: '1.4km', deliveryTime: '35min' },
    ],
  },
};

// 日志工具
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${type}] ${message}`;
  console.log(logLine);
  
  // 写入日志文件（异步，不阻塞）
  fs.mkdir(path.dirname(CONFIG.logFile), { recursive: true })
    .then(() => fs.appendFile(CONFIG.logFile, logLine + '\n'))
    .catch(() => {}); // 忽略日志写入错误
}

// 生成图片 URL（使用 Unsplash 随机美食图片）
function generateImageUrl(category, index) {
  const keywords = {
    breakfast: 'breakfast,chinese,food',
    lunch: 'lunch,chinese,meal',
    'afternoon-tea': 'tea,coffee,snack',
    dinner: 'dinner,chinese,food',
    'night-snack': 'snack,street,food',
  };
  
  const keyword = keywords[category] || 'food';
  // 使用不同的 seed 确保图片不重复
  return `https://images.unsplash.com/photo-${getPhotoId(category, index)}?w=400&h=300&fit=crop`;
}

// 生成稳定的图片 ID（基于分类和索引）
function getPhotoId(category, index) {
  const photoIds = {
    breakfast: ['1619096252214-ef06c45683e3', '1625220194771-7ebdea0b70b9', '1541696432-82c6da8ce7bf', '1565296969296-75e591840652', '1504692545438-ef79a4f73bd4'],
    lunch: ['1565296969296-75e591840652', '1504692545438-ef79a4f73bd4', '1565550513478-8a171993f472', '1555932684-02e6fef4f1c3', '1541696432-82c6da8ce7bf'],
    'afternoon-tea': ['1541696432-82c6da8ce7bf', '1572480068859-687271897f5a', '1517701579177-4e49669602cc', '1576613204691-1a6fe05a932e', '1561858329-62b88a2723e3'],
    dinner: ['1565296969296-75e591840652', '1555932684-02e6fef4f1c3', '1504692545438-ef79a4f73bd4', '1565550513478-8a171993f472', '1619096252214-ef06c45683e3'],
    'night-snack': ['1555932684-02e6fef4f1c3', '1565550513478-8a171993f472', '1504692545438-ef79a4f73bd4', '1619096252214-ef06c45683e3', '1541696432-82c6da8ce7bf'],
  };
  
  const ids = photoIds[category] || photoIds.lunch;
  return ids[index % ids.length];
}

// 生成 CPS 推广链接
function generateCPSLink(productName, category, platform = 'meituan') {
  // 实际应该调用美团/饿了么 CPS API
  // 这里生成模拟链接用于演示
  const encodedName = encodeURIComponent(productName);
  const timestamp = Date.now();
  
  if (platform === 'meituan') {
    return `https://i.meituan.com/cps/${category}/${encodedName}?t=${timestamp}`;
  } else if (platform === 'eleme') {
    return `https://h5.ele.me/cps/${category}/${encodedName}?t=${timestamp}`;
  }
  
  return `https://i.meituan.com/cps/${category}/${encodedName}`;
}

// 从 JSON 文件加载现有数据
async function loadExistingData() {
  try {
    const data = await fs.readFile(CONFIG.dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    log('无法加载现有数据，将创建新数据', 'WARN');
    return {};
  }
}

// 备份现有数据
async function backupData() {
  try {
    const data = await fs.readFile(CONFIG.dataFilePath, 'utf-8');
    const backupFile = `${CONFIG.backupPath}.${Date.now()}`;
    await fs.writeFile(backupFile, data);
    log(`数据已备份：${path.basename(backupFile)}`);
    return true;
  } catch (error) {
    log(`备份失败：${error.message}`, 'ERROR');
    return false;
  }
}

// 爬取商品数据（模拟）
async function crawlProducts(platform = 'meituan') {
  log(`开始爬取 ${platform} 商品数据...`);
  
  const products = {};
  
  for (const category of CONFIG.categories) {
    const mockItems = CONFIG.mockProducts[category] || [];
    products[category] = [];
    
    for (let i = 0; i < mockItems.length; i++) {
      const item = mockItems[i];
      const product = {
        name: item.name,
        img: generateImageUrl(category, i),
        promoUrl: generateCPSLink(item.name, category, platform),
        cpsLink: generateCPSLink(item.name, category, platform),
        category,
        priceMin: item.basePrice * 0.9, // 优惠后价格
        priceMax: item.basePrice * 1.1,
        rating: item.rating,
        distance: item.distance,
        deliveryTime: item.deliveryTime,
        platform,
        crawledAt: new Date().toISOString(),
      };
      
      products[category].push(product);
      log(`  ✓ ${category}: ${product.name}`, 'DEBUG');
    }
  }
  
  log(`爬取完成，共 ${CONFIG.categories.length} 个分类`);
  return products;
}

// 保存数据到 JSON 文件
async function saveToJsonFile(products) {
  try {
    // 简化数据结构（保持向后兼容）
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
    log(`数据已保存到：${CONFIG.dataFilePath}`);
    return true;
  } catch (error) {
    log(`保存 JSON 失败：${error.message}`, 'ERROR');
    return false;
  }
}

// 保存数据到数据库（使用 Supabase）
async function saveToDatabase(products) {
  let successCount = 0;
  let updateCount = 0;
  
  try {
    log('开始同步数据到数据库...');
    
    for (const [category, items] of Object.entries(products)) {
      for (const item of items) {
        try {
          // 先查找是否存在
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('name', item.name)
            .eq('category', item.category)
            .single();
          
          let result;
          
          if (existing) {
            // 更新现有记录
            result = await supabase
              .from('products')
              .update({
                img: item.img,
                promo_url: item.promoUrl,
                cps_link: item.cpsLink,
                price_min: item.priceMin,
                price_max: item.priceMax,
                rating: item.rating,
                distance: item.distance,
                delivery_time: item.deliveryTime,
                is_active: true,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id);
            
            updateCount++;
          } else {
            // 创建新记录
            result = await supabase
              .from('products')
              .insert({
                name: item.name,
                img: item.img,
                promo_url: item.promoUrl,
                cps_link: item.cpsLink,
                category: item.category,
                price_min: item.priceMin,
                price_max: item.priceMax,
                rating: item.rating,
                distance: item.distance,
                delivery_time: item.deliveryTime,
                is_active: true,
                sort_order: successCount,
              });
            
            successCount++;
          }
          
          if (result.error) {
            log(`  ✗ 数据库错误 ${item.name}: ${result.error.message}`, 'ERROR');
          } else {
            log(`  ✓ 数据库同步：${item.name}`, 'DEBUG');
          }
        } catch (error) {
          log(`  ✗ 同步失败 ${item.name}: ${error.message}`, 'ERROR');
        }
      }
    }
    
    log(`数据库同步完成：新增 ${successCount} 条，更新 ${updateCount} 条`);
    return true;
  } catch (error) {
    log(`数据库同步失败：${error.message}`, 'ERROR');
    return false;
  }
}

// 去重和清理
function deduplicateProducts(products) {
  log('执行去重操作...');
  
  for (const [category, items] of Object.entries(products)) {
    const seen = new Set();
    products[category] = items.filter(item => {
      const key = item.name.toLowerCase();
      if (seen.has(key)) {
        log(`  移除重复：${item.name}`, 'DEBUG');
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  return products;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const platform = args.includes('--platform') ? args[args.indexOf('--platform') + 1] : 'meituan';
  const isFullUpdate = args.includes('--full');
  
  log('========================================');
  log('吃了么 - 商品数据爬虫启动');
  log(`平台：${platform}`);
  log(`模式：${isFullUpdate ? '全量更新' : '增量更新'}`);
  log('========================================');
  
  try {
    // 1. 备份现有数据
    if (!isFullUpdate) {
      await backupData();
    }
    
    // 2. 爬取商品数据
    const products = await crawlProducts(platform);
    
    // 3. 去重
    const dedupedProducts = deduplicateProducts(products);
    
    // 4. 保存到 JSON 文件
    await saveToJsonFile(dedupedProducts);
    
    // 5. 同步到数据库
    await saveToDatabase(dedupedProducts);
    
    // 6. 生成报告
    const report = generateReport(dedupedProducts);
    log('\n' + report);
    
    log('========================================');
    log('爬虫任务完成 ✅');
    log('========================================');
    
    process.exit(0);
  } catch (error) {
    log(`爬虫任务失败：${error.message}`, 'ERROR');
    log(error.stack, 'ERROR');
    process.exit(1);
  }
}

// 生成报告
function generateReport(products) {
  let report = '📊 爬虫报告\n';
  report += '─────────────────────────────────\n';
  
  let totalCount = 0;
  for (const [category, items] of Object.entries(products)) {
    report += `${category.padEnd(15)}: ${items.length} 个商品\n`;
    totalCount += items.length;
  }
  
  report += '─────────────────────────────────\n';
  report += `总计：${totalCount} 个商品\n`;
  report += `更新时间：${new Date().toISOString()}\n`;
  
  return report;
}

// 运行
main();
