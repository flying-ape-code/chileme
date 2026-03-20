#!/bin/bash
# 每小时爬虫脚本（本地运行）

cd ~/chileme

echo "🕐 爬虫执行时间：$(date)"

# 运行爬虫
npm run crawler

# 备份数据
node scripts/backup-meals.js

echo "✅ 爬虫执行完成"
