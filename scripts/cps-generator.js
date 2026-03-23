#!/usr/bin/env node

/**
 * 吃了么 - CPS 链接生成服务
 * 功能：批量生成/更新商品的 CPS 推广链接
 * 
 * 使用方式：
 *   node scripts/cps-generator.js
 *   node scripts/cps-generator.js --refresh  # 强制刷新所有链接
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 配置
const CONFIG = {
  dataFilePath: path.join(__dirname, '..', 'meals-data.json'),
  logFile: path.join(__dirname, '..', 'logs', `cps-${new Date().toISOString().split('T')[0]}.log`),
  // 美团 CPS 配置（从环境变量读取）
  meituan: {
    appkey: process.env.VITE_MEITUAN_APPKEY || '1b2a6f8c202ca60b6ec6fddd93fd7397',
    secret: process.env.VITE_MEITUAN_SECRET || 'ce89fdb7326d30a15b2fdc400e3835cb',
    positionId: process.env.VITE_MEITUAN_POSITION_ID || 'shipinwaimai',
    channelId: process.env.VITE_MEITUAN_CHANNEL_ID || '473920',
    miniAppId: process.env.VITE_MEITUAN_MINI_APP_ID || 'wxde8ac0a21135c0',
  },
  // 饿了么 CPS 配置（示例）
  eleme: {
    pid: process.env.VITE_ELEME_PID || '',
    secret: process.env.VITE_ELEME_SECRET || '',
  },
};

// 日志工具
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${type}] ${message}`;
  console.log(logLine);
  
  fs.mkdir(path.dirname(CONFIG.logFile), { recursive: true })
    .then(() => fs.appendFile(CONFIG.logFile, logLine + '\n'))
    .catch(() => {});
}

// 生成签名（美团 API）
function generateMeituanSign(params, secret) {
  // 参数排序
  const sortedKeys = Object.keys(params).sort();
  const sortedParams = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  
  // 生成签名
  const signStr = sortedParams + secret;
  return crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
}

// 生成美团 CPS 链接
function generateMeituanCPSLink(product) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  
  const params = {
    appkey: CONFIG.meituan.appkey,
    timestamp: timestamp.toString(),
    nonce,
    positionId: CONFIG.meituan.positionId,
    channelId: CONFIG.meituan.channelId,
    miniAppId: CONFIG.meituan.miniAppId,
    goodsName: product.name,
  };
  
  const sign = generateMeituanSign(params, CONFIG.meituan.secret);
  
  // 构建推广链接
  const baseUrl = 'https://u.meituan.com/cps/promotion';
  const queryParams = new URLSearchParams({
    ...params,
    sign,
  }).toString();
  
  return `${baseUrl}?${queryParams}`;
}

// 生成饿了么 CPS 链接（示例）
function generateElemeCPSLink(product) {
  if (!CONFIG.eleme.pid) {
    log('饿了么 PID 未配置，使用默认链接', 'WARN');
    return `https://h5.ele.me/cps/${encodeURIComponent(product.name)}`;
  }
  
  const timestamp = Date.now();
  const params = {
    pid: CONFIG.eleme.pid,
    goodsName: product.name,
    timestamp: timestamp.toString(),
  };
  
  // 饿了么签名逻辑（示例）
  const signStr = Object.keys(params).sort()
    .map(key => `${key}=${params[key]}`)
    .join('&') + CONFIG.eleme.secret;
  
  const sign = crypto.createHash('md5').update(signStr).digest('hex');
  
  const baseUrl = 'https://guiding-aladdin.meituan.com/aladdin/guide/miniapp';
  const queryParams = new URLSearchParams({
    ...params,
    sign,
  }).toString();
  
  return `${baseUrl}?${queryParams}`;
}

// 加载商品数据
async function loadProducts() {
  try {
    const data = await fs.readFile(CONFIG.dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    log(`加载商品数据失败：${error.message}`, 'ERROR');
    return null;
  }
}

// 保存商品数据
async function saveProducts(data) {
  try {
    await fs.writeFile(CONFIG.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    log('商品数据已保存');
    return true;
  } catch (error) {
    log(`保存商品数据失败：${error.message}`, 'ERROR');
    return false;
  }
}

// 批量生成 CPS 链接
async function generateAllCPSLinks(refresh = false) {
  log('开始生成 CPS 链接...');
  
  const products = await loadProducts();
  if (!products) {
    return false;
  }
  
  let totalCount = 0;
  let updateCount = 0;
  
  for (const [category, items] of Object.entries(products)) {
    log(`处理分类：${category}`);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      totalCount++;
      
      // 如果已有 CPS 链接且不强制刷新，跳过
      if (item.cpsLink && !refresh) {
        log(`  ⏭️ 跳过：${item.name}（已有 CPS 链接）`, 'DEBUG');
        continue;
      }
      
      // 生成美团 CPS 链接
      const cpsLink = generateMeituanCPSLink(item);
      item.cpsLink = cpsLink;
      item.promoUrl = cpsLink; // 保持兼容
      item.platform = 'meituan';
      item.cpsUpdatedAt = new Date().toISOString();
      
      updateCount++;
      log(`  ✓ 生成：${item.name}`, 'DEBUG');
    }
  }
  
  // 保存更新后的数据
  await saveProducts(products);
  
  log(`CPS 链接生成完成：${updateCount}/${totalCount} 个商品已更新`);
  return true;
}

// 验证 CPS 链接（可选）
async function verifyCPSLinks() {
  log('验证 CPS 链接有效性...');
  
  const products = await loadProducts();
  if (!products) {
    return false;
  }
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const [category, items] of Object.entries(products)) {
    for (const item of items) {
      if (item.cpsLink && item.cpsLink.includes('meituan.com')) {
        validCount++;
      } else {
        invalidCount++;
        log(`  ⚠️ 无效链接：${item.name}`, 'WARN');
      }
    }
  }
  
  log(`验证完成：${validCount} 有效，${invalidCount} 无效`);
  return { valid: validCount, invalid: invalidCount };
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const refresh = args.includes('--refresh');
  const verify = args.includes('--verify');
  
  log('========================================');
  log('吃了么 - CPS 链接生成服务');
  log(`模式：${refresh ? '强制刷新' : '增量更新'}`);
  log('========================================');
  
  try {
    if (verify) {
      await verifyCPSLinks();
    } else {
      await generateAllCPSLinks(refresh);
    }
    
    log('========================================');
    log('CPS 链接生成完成 ✅');
    log('========================================');
    
    process.exit(0);
  } catch (error) {
    log(`CPS 链接生成失败：${error.message}`, 'ERROR');
    log(error.stack, 'ERROR');
    process.exit(1);
  }
}

// 运行
main();
