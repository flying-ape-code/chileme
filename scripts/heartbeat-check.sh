#!/bin/bash
# heartbeat-check.sh - 心跳检查脚本（每小时执行）
# 用法：./heartbeat-check.sh

set -e

REPO="flying-ape-code/chileme"
MEMORY_DIR="$(dirname "$0")/../../memory"
LOG_FILE="$(dirname "$0")/../logs/heartbeat.log"
TODAY=$(date '+%Y-%m-%d')
MEMORY_FILE="$MEMORY_DIR/$TODAY.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

echo "💓 心跳检查 - $TIMESTAMP"
echo ""

# 确保日志目录存在
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$MEMORY_DIR"

# 记录心跳开始
echo "[$TIMESTAMP] 心跳检查开始" >> "$LOG_FILE"

# 1️⃣ 检查 GitHub Issues
echo "1️⃣ 检查 GitHub Issues..."
OPEN_ISSUES=$(gh issue list --repo "$REPO" --state open --limit 20)
ISSUE_COUNT=$(echo "$OPEN_ISSUES" | grep -c "." || echo "0")

echo "   发现 $ISSUE_COUNT 个 open issues"
echo "[$TIMESTAMP] 发现 $ISSUE_COUNT 个 open issues" >> "$LOG_FILE"

# 2️⃣ 按优先级排序
echo ""
echo "2️⃣ 优先级分析..."

P0_COUNT=$(echo "$OPEN_ISSUES" | grep -c "priority:P0" || echo "0")
P1_COUNT=$(echo "$OPEN_ISSUES" | grep -c "priority:P1" || echo "0")
P2_COUNT=$(echo "$OPEN_ISSUES" | grep -c "priority:P2" || echo "0")
P3_COUNT=$(echo "$OPEN_ISSUES" | grep -c "priority:P3" || echo "0")

echo "   P0 (紧急): $P0_COUNT"
echo "   P1 (高):   $P1_COUNT"
echo "   P2 (中):   $P2_COUNT"
echo "   P3 (低):   $P3_COUNT"

# 3️⃣ 检查超时任务
echo ""
echo "3️⃣ 检查超时任务..."
if [ -f "$(dirname "$0")/check-overdue-tasks.sh" ]; then
  $(dirname "$0")/check-overdue-tasks.sh 24
else
  echo "   ⚠️  check-overdue-tasks.sh 不存在，跳过超时检查"
fi

# 4️⃣ 选择任务执行
echo ""
echo "4️⃣ 选择任务执行..."

# 优先处理 P0/P1
if [ "$P0_COUNT" -gt 0 ]; then
  echo "   🔥 发现 P0 紧急任务，优先处理!"
  NEXT_ACTION="执行 P0 任务"
elif [ "$P1_COUNT" -gt 0 ]; then
  echo "   🚀 发现 P1 高优先级任务，优先处理!"
  NEXT_ACTION="执行 P1 任务"
elif [ "$ISSUE_COUNT" -gt 0 ]; then
  echo "   ✅ 按顺序处理任务"
  NEXT_ACTION="执行普通任务"
else
  echo "   😌 无任务，发送摸鱼消息"
  NEXT_ACTION="摸鱼"
fi

# 5️⃣ 更新 memory
echo ""
echo "5️⃣ 更新 memory..."

# 如果 memory 文件不存在，创建它
if [ ! -f "$MEMORY_FILE" ]; then
  cat > "$MEMORY_FILE" << EOF
# $TODAY 工作记录

## 📊 工作总结

**任务完成数：** 0
**构建状态：** -
**备注：** 首次创建

---

**记录时间：** $TIMESTAMP
EOF
fi

# 追加心跳记录
cat >> "$MEMORY_FILE" << EOF

---

## 🕐 $TIMESTAMP - 心跳检查

### GitHub Issues 状态
- Open Issues: $ISSUE_COUNT 个
- P0 (紧急): $P0_COUNT
- P1 (高): $P1_COUNT
- P2 (中): $P2_COUNT
- P3 (低): $P3_COUNT

### 下一步行动
- $NEXT_ACTION

---
EOF

echo "   ✅ 已更新 $MEMORY_FILE"
echo "[$TIMESTAMP] 已更新 memory/$TODAY.md" >> "$LOG_FILE"

# 6️⃣ 完成
echo ""
echo "✅ 心跳检查完成"
echo "[$TIMESTAMP] 心跳检查完成" >> "$LOG_FILE"
echo ""

# 返回下一步行动
echo "📋 下一步：$NEXT_ACTION"
