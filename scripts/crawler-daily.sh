#!/bin/bash

# 吃了么 - 商品数据爬虫定时任务
# 用途：每日自动更新商品数据
# 配置：每天凌晨 3:00 执行

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/crawler-daily-$(date +%Y-%m-%d).log"

# 确保日志目录存在
mkdir -p "$LOG_DIR"

echo "=========================================="
echo "吃了么 - 商品数据爬虫"
echo "时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# 切换到项目目录
cd "$PROJECT_DIR"

# 执行爬虫脚本
echo "开始执行爬虫..."
node scripts/crawler-products.js --platform meituan 2>&1 | tee -a "$LOG_FILE"

# 检查执行结果
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ 爬虫任务成功完成"
    echo "日志：$LOG_FILE"
else
    echo "❌ 爬虫任务失败"
    echo "请检查日志：$LOG_FILE"
    exit 1
fi

# 可选：发送通知到 Telegram
# 如果配置了通知，可以在这里添加
# curl -s "https://api.telegram.org/bot$BOT_TOKEN/sendMessage?chat_id=$CHAT_ID&text=吃了么商品数据更新完成" > /dev/null

echo "=========================================="
