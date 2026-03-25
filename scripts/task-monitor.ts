/**
 * 任务监控系统 (Task Monitor System)
 * 1. 每 5 分钟检查 GitHub Issues
 * 2. 检测超时任务 (24小时未更新)
 * 3. 发送 Telegram 通知
 * 4. 记录日志
 */

import axios from 'axios';
import cron from 'node-cron';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置 (Environment Variables)
const CONFIG = {
  GITHUB_REPO: process.env.GITHUB_REPO || 'flying-ape-code/chileme',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
  TIMEOUT_HOURS: 24, // 24小时未更新视为超时
  LOG_DIR: join(__dirname, '../logs'),
  LOG_FILE: join(__dirname, '../logs/task-monitor.log'),
  CRON_SCHEDULE: '*/5 * * * *' // 每 5 分钟
};

/**
 * 简单的日志记录器
 */
function log(message: string, level: 'INFO' | 'ERROR' | 'WARN' = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  if (!existsSync(CONFIG.LOG_DIR)) {
    mkdirSync(CONFIG.LOG_DIR, { recursive: true });
  }
  
  appendFileSync(CONFIG.LOG_FILE, logMessage);
}

/**
 * 发送 Telegram 通知
 */
async function sendTelegramNotification(message: string) {
  if (!CONFIG.TELEGRAM_BOT_TOKEN || !CONFIG.TELEGRAM_CHAT_ID) {
    log('Telegram credentials not configured. Skipping notification.', 'WARN');
    return;
  }

  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    await axios.post(url, {
      chat_id: CONFIG.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    log('Telegram notification sent successfully.');
  } catch (error: any) {
    log(`Failed to send Telegram notification: ${error.message}`, 'ERROR');
  }
}

/**
 * 检查 GitHub Issues
 */
async function checkGithubIssues() {
  log('Checking GitHub Issues for timeout tasks...');
  
  if (!CONFIG.GITHUB_TOKEN) {
    log('GITHUB_TOKEN not configured. Skipping check.', 'ERROR');
    return;
  }

  const url = `https://api.github.com/repos/${CONFIG.GITHUB_REPO}/issues`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        state: 'open',
        per_page: 100
      }
    });

    const issues = response.data;
    const now = new Date();
    const timeoutThreshold = new Date(now.getTime() - CONFIG.TIMEOUT_HOURS * 60 * 60 * 1000);
    
    const timeoutIssues = issues.filter((issue: any) => {
      // 排除 Pull Requests (GitHub Issues API 返回 issue 和 PR)
      if (issue.pull_request) return false;
      
      const updatedAt = new Date(issue.updated_at);
      return updatedAt < timeoutThreshold;
    });

    if (timeoutIssues.length > 0) {
      log(`Found ${timeoutIssues.length} timeout tasks.`, 'WARN');
      
      let message = `🚨 *任务超时警报* (${CONFIG.GITHUB_REPO})\n\n`;
      message += `以下任务超过 ${CONFIG.TIMEOUT_HOURS} 小时未更新：\n\n`;
      
      timeoutIssues.forEach((issue: any) => {
        message += `• [#${issue.number}](${issue.html_url}) - ${issue.title}\n`;
        message += `  👤 负责人: ${issue.assignee ? issue.assignee.login : '未分配'}\n`;
        message += `  🕒 最后更新: ${new Date(issue.updated_at).toLocaleString('zh-CN')}\n\n`;
      });

      await sendTelegramNotification(message);
    } else {
      log('No timeout tasks detected.');
    }
  } catch (error: any) {
    log(`Error fetching GitHub issues: ${error.message}`, 'ERROR');
  }
}

/**
 * 主程序
 */
function main() {
  log('========================================');
  log('🚀 Task Monitor System Started');
  log(`📅 Schedule: ${CONFIG.CRON_SCHEDULE}`);
  log(`🔗 Repo: ${CONFIG.GITHUB_REPO}`);
  log('========================================');

  // 立即执行一次
  checkGithubIssues().catch(err => log(`Initial check failed: ${err.message}`, 'ERROR'));

  // 配置定时任务
  cron.schedule(CONFIG.CRON_SCHEDULE, () => {
    checkGithubIssues().catch(err => log(`Scheduled check failed: ${err.message}`, 'ERROR'));
  }, {
    timezone: 'Asia/Shanghai'
  });
}

// 异常处理
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'ERROR');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled Rejection: ${reason}`, 'ERROR');
});

// 运行主程序
main();
