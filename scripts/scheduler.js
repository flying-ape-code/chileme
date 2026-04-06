#!/usr/bin/env node

/**
 * 定时任务调度器
 * 用途：每小时执行商品数据同步（已禁用）
 */

import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取爬虫配置
const configPath = join(__dirname, '..', 'crawler-config.json');
let crawlerConfig = { enabled: false };

try {
  const configContent = fs.readFileSync(configPath, 'utf-8');
  crawlerConfig = JSON.parse(configContent);
} catch (error) {
  console.error('❌ 读取爬虫配置失败:', error.message);
}

// 检查是否启用
if (!crawlerConfig.enabled) {
  console.log('========================================');
  console.log('⚠️  爬虫功能已禁用');
  console.log('========================================');
  console.log('📝 配置说明:', crawlerConfig.dataSource?.description || '手动模式');
  console.log('💡 如需启用，请修改 crawler-config.json 中的 enabled 为 true');
  console.log('========================================');
  process.exit(0);
}

// 如果启用了，继续执行爬虫逻辑
import { spawn } from 'child_process';

const CONFIG = {
  crawlerScript: join(__dirname, 'crawler.js'),
  logPath: join(__dirname, '..', 'logs', 'scheduler.log'),
  cronSchedule: crawlerConfig.updateInterval || '0 * * * *'
};

function runCrawler() {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 🚀 开始执行爬虫任务...`);

  const crawlerProcess = spawn('node', [CONFIG.crawlerScript], {
    cwd: join(__dirname, '..'),
    stdio: 'inherit'
  });

  crawlerProcess.on('close', (code) => {
    const timestamp = new Date().toISOString();
    if (code === 0) {
      console.log(`[${timestamp}] ✅ 爬虫任务执行成功`);
    } else {
      console.error(`[${timestamp}] ❌ 爬虫任务执行失败，退出码：${code}`);
    }
  });

  crawlerProcess.on('error', (error) => {
    console.error(`[${timestamp}] ❌ 启动爬虫进程失败:`, error);
  });
}

function main() {
  console.log('========================================');
  console.log('🕷️ 美团热门商品爬虫 - 定时任务');
  console.log('========================================');
  console.log(`📅 调度规则：${CONFIG.cronSchedule}`);
  console.log(`⏰ 下次执行：下一个整点`);
  console.log('========================================');

  console.log('🔄 启动时执行一次爬虫...');
  runCrawler();

  const task = cron.schedule(CONFIG.cronSchedule, () => {
    runCrawler();
  }, {
    scheduled: true,
    timezone: 'Asia/Shanghai'
  });

  console.log('✅ 定时任务已启动');
  console.log('💡 按 Ctrl+C 退出');

  process.on('SIGINT', () => {
    console.log('\n\n🛑 收到退出信号，正在停止定时任务...');
    task.stop();
    process.exit(0);
  });
}

main();
