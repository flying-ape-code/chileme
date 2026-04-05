#!/bin/bash
# check-overdue-tasks.sh - 检查超时任务并自动标记
# 用法：./check-overdue-tasks.sh [timeout_hours]

set -e

REPO="flying-ape-code/chileme"
TIMEOUT_HOURS="${1:-24}"  # 默认 24 小时超时

echo "⏰ 检查超时任务 (超时阈值：${TIMEOUT_HOURS}小时)..."
echo ""

# 获取当前时间戳
NOW=$(date +%s)
TIMEOUT_SECONDS=$((TIMEOUT_HOURS * 3600))

# 获取所有 open issues 中状态为 "In Progress" 的任务
IN_PROGRESS_ISSUES=$(gh issue list \
  --repo "$REPO" \
  --state open \
  --label "status:in-progress" \
  --json number,title,labels,createdAt,updatedAt \
  --jq '.[] | select(.updatedAt != null)')

if [ -z "$IN_PROGRESS_ISSUES" ]; then
  echo "✅ 没有进行中的任务"
  exit 0
fi

# 检查每个任务的更新时间
OVERDUE_COUNT=0

echo "📋 检查进行中的任务:"
echo ""

echo "$IN_PROGRESS_ISSUES" | jq -r '.[] | "\(.number)|\(.title)|\(.updatedAt)"' | while IFS='|' read -r NUMBER TITLE UPDATED_AT; do
  # 解析更新时间
  UPDATED_TIMESTAMP=$(date -d "$UPDATED_AT" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$UPDATED_AT" +%s 2>/dev/null || echo "0")
  
  # 计算时间差（小时）
  TIME_DIFF=$(( (NOW - UPDATED_TIMESTAMP) / 3600 ))
  
  echo "  #$NUMBER - $TITLE"
  echo "    最后更新：$UPDATED_AT (${TIME_DIFF}小时前)"
  
  if [ "$TIME_DIFF" -gt "$TIMEOUT_HOURS" ]; then
    echo "    ⚠️  已超时！(${TIME_DIFF}h > ${TIMEOUT_HOURS}h)"
    
    # 添加超时评论
    gh issue comment "$NUMBER" \
      --repo "$REPO" \
      --body "⏰ **任务超时提醒**\n\n此任务已超过 ${TIMEOUT_HOURS} 小时无更新（最后更新：${UPDATED_AT}）。\n\n如有阻塞请及时沟通！"
    
    # 添加超时标签
    gh issue edit "$NUMBER" --repo "$REPO" --add-label "status:blocked"
    
    OVERDUE_COUNT=$((OVERDUE_COUNT + 1))
    echo "    ✅ 已添加超时评论和 blocked 标签"
  else
    echo "    ✅ 正常"
  fi
  
  echo ""
done

echo "📊 检查完成"
echo "  检查任务数：$(echo "$IN_PROGRESS_ISSUES" | jq -s 'length')"
echo "  超时任务数：$OVERDUE_COUNT"

# 记录日志
LOG_FILE="$(dirname "$0")/../logs/task-dispatch.log"
mkdir -p "$(dirname "$LOG_FILE")"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 超时检查完成 - 发现 $OVERDUE_COUNT 个超时任务" >> "$LOG_FILE"
