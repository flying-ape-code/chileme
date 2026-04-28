/**
 * 美团热门商品爬虫
 * 爬取热门商品数据并更新到数据库
 */

import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const CATEGORIES = {
  breakfast: '早餐',
  lunch: '午餐',
  'afternoon-tea': '下午茶',
  dinner: '晚餐',
  'night-snack': '夜宵'
};

async function crawlMeituanCategory(category) {
  console.log(`🕷️ 开始爬取分类：${category}`);
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    // 访问美团外卖热门商品页面
    await page.goto(`https://waimai.meituan.com/${category}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 提取商品数据
    const products = await page.evaluate(() => {
      const items = document.querySelectorAll('.product-item');
      return Array.from(items).map(item => ({
        name: item.querySelector('.product-name')?.textContent || '',
        image: item.querySelector('img')?.src || '',
        price: item.querySelector('.price')?.textContent || '',
        link: item.querySelector('a')?.href || ''
      }));
    });
    
    console.log(`✅ 爬取到 ${products.length} 个商品`);
    return products;
  } catch (error) {
    console.error(`❌ 爬取失败:`, error.message);
    return [];
  } finally {
    await browser.close();
  }
}

async function saveToDatabase(products, category) {
  console.log(`💾 保存商品到数据库...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of products) {
    try {
      const { error } = await supabase
        .from('meals')
        .upsert({
          name: product.name,
          category,
          image_url: product.image,
          cps_link: product.link,
          price: parseFloat(product.price) || 0,
          is_active: true,
          last_checked_at: new Date().toISOString()
        }, {
          onConflict: 'name,category'
        });
      
      if (error) {
        console.error(`❌ 保存失败 ${product.name}:`, error.message);
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`❌ 异常 ${product.name}:`, err);
      errorCount++;
    }
  }
  
  console.log(`✅ 保存完成：成功 ${successCount}, 失败 ${errorCount}`);
}

async function main() {
  console.log('🚀 开始爬取美团热门商品...');
  
  for (const [enCategory, zhCategory] of Object.entries(CATEGORIES)) {
    const products = await crawlMeituanCategory(enCategory);
    if (products.length > 0) {
      await saveToDatabase(products, enCategory);
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('✅ 爬取完成！');
}

main().catch(console.error);
