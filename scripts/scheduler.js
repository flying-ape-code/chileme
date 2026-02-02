#!/usr/bin/env node

/**
 * 定时任务调度器
 * 用途：每小时执行美团热门商品爬虫
 */

import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置
const CONFIG = {
  // 爬虫脚本路径
  crawlerScript: join(__dirname, 'crawler.js'),
  // 日志路径
  logPath: join(__dirname, '..', 'logs', 'scheduler.log'),
  // Cron表达式：每小时执行一次
  cronSchedule: '0 * * * *'
};

/**
 * 执行爬虫
 */
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
      console.error(`[${timestamp}] ❌ 爬虫任务执行失败，退出码: ${code}`);
    }
  });

  crawlerProcess.on('error', (error) => {
    console.error(`[${timestamp}] ❌ 启动爬虫进程失败:`, error);
  });
}

/**
 * 主函数
 */
function main() {
  console.log('========================================');
  console.log('美团热门商品爬虫 - 定时任务');
  console.log('========================================');
  console.log(`📅 调度规则: ${CONFIG.cronSchedule}`);
  console.log(`⏰ 下次执行: 下一个整点`);
  console.log('========================================');

  // 立即执行一次（可选）
  console.log('🔄 启动时执行一次爬虫...');
  runCrawler();

  // 配置定时任务
  const task = cron.schedule(CONFIG.cronSchedule, () => {
    runCrawler();
  }, {
    scheduled: true,
    timezone: 'Asia/Shanghai'
  });

  console.log('✅ 定时任务已启动');
  console.log('💡 按 Ctrl+C 退出');

  // 优雅退出
  process.on('SIGINT', () => {
    console.log('\n\n🛑 收到退出信号，正在停止定时任务...');
    task.stop();
    console.log('✅ 定时任务已停止');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n🛑 收到终止信号，正在停止定时任务...');
    task.stop();
    console.log('✅ 定时任务已停止');
    process.exit(0);
  });
}

// 启动主函数
main();
