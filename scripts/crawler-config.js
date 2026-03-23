#!/usr/bin/env node

/**
 * 美团热门商品爬虫 - 数据库版本
 * 用途：从配置文件加载商品数据，写入 Supabase products 表
 * 说明：由于美团外卖需要登录且反爬严格，本方案采用手动维护数据的方式
 */

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 错误：缺少 Supabase 配置');
  console.error('   请确保 .env 文件中包含 VITE_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// 配置
const CONFIG = {
  // 配置文件路径
  configPath: path.join(process.cwd(), 'crawler-config.json'),
  // Unsplash 图片模板
  imageTemplate: 'https://images.unsplash.com/photo-{id}?w=400&h=400&fit=crop',
  // Unsplash 图片 ID 池
  imageIds: [
    '1619096252214-ef06c45683e3', // 煎饼果子
    '1625220194771-7ebdea0b70b9', // 皮蛋瘦肉粥
    '1541696432-82c6da8ce7bf', // 小笼包
    '1526318896980-cf78c088247c', // 小馄饨
    '1526777563695-e4f8c170db06', // 热干面
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
 * 加载配置
 */
async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG.configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 加载配置失败:', error.message);
    return { products: [] };
  }
}

/**
 * 从数据库加载商品
 */
async function loadProductsFromDB() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('❌ 加载商品失败:', error.message);
    return [];
  }

  return data || [];
}

/**
 * 保存商品到数据库
 */
async function saveProductsToDB(products) {
  const stats = {
    inserted: 0,
    updated: 0,
    failed: 0
  };

  for (const product of products) {
    try {
      // 检查是否已存在
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('name', product.name)
        .eq('category', product.category)
        .single();

      if (existing) {
        // 更新现有商品
        const { error } = await supabase
          .from('products')
          .update({
            img: product.img,
            promoUrl: product.promoUrl,
            cpsLink: product.cpsLink,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error(`❌ 更新失败 ${product.name}: ${error.message}`);
          stats.failed++;
        } else {
          stats.updated++;
        }
      } else {
        // 插入新商品
        const { error } = await supabase
          .from('products')
          .insert([{
            name: product.name,
            category: product.category,
            img: product.img,
            promoUrl: product.promoUrl || null,
            cpsLink: product.cpsLink || null,
            isActive: true,
            sortOrder: 0
          }]);

        if (error) {
          console.error(`❌ 插入失败 ${product.name}: ${error.message}`);
          stats.failed++;
        } else {
          stats.inserted++;
        }
      }
    } catch (error) {
      console.error(`❌ 处理失败 ${product.name}: ${error.message}`);
      stats.failed++;
    }
  }

  return stats;
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
美团商品管理工具 - 数据库版本

用法:
  node scripts/crawler-config.js <command>

命令:
  list     - 列出所有商品
  add      - 添加商品 (需要配置)
  sync     - 从配置同步到数据库
  backup   - 备份数据库数据到 JSON

示例:
  node scripts/crawler-config.js list
  node scripts/crawler-config.js sync
`);
}

/**
 * 主函数
 */
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'list': {
      console.log('📦 加载商品列表...\n');
      const products = await loadProductsFromDB();
      
      const grouped = products.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p);
        return acc;
      }, {});

      for (const [category, items] of Object.entries(grouped)) {
        console.log(`\n${category.toUpperCase()} (${items.length} 个商品):`);
        items.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.name}`);
        });
      }
      break;
    }

    case 'sync': {
      console.log('🔄 从配置同步到数据库...\n');
      const config = await loadConfig();
      const stats = await saveProductsToDB(config.products || []);
      
      console.log('\n✅ 同步完成:');
      console.log(`   新增：${stats.inserted}`);
      console.log(`   更新：${stats.updated}`);
      console.log(`   失败：${stats.failed}`);
      break;
    }

    case 'backup': {
      console.log('💾 备份数据库数据...\n');
      const products = await loadProductsFromDB();
      
      const backupData = products.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push({
          name: p.name,
          img: p.img,
          promoUrl: p.promoUrl || p.cpsLink,
          cpsLink: p.cpsLink,
          originalUrl: p.originalUrl,
          cpsGeneratedAt: p.cpsGeneratedAt,
          clickCount: p.clickCount
        });
        return acc;
      }, {});

      const backupPath = path.join(process.cwd(), `meals-data-backup-${Date.now()}.json`);
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
      
      console.log(`✅ 备份完成：${backupPath}`);
      break;
    }

    default:
      showHelp();
  }
}

main().catch(console.error);
