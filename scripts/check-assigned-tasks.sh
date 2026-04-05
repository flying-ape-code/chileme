#!/bin/bash
# check-assigned-tasks.sh - Agent 启动时检查分配的任务
# 用法：./check-assigned-tasks.sh [username]

set -e

REPO="flying-ape-code/chileme"

# 获取当前 GitHub 用户（如果没有指定）
if [ -z "$1" ]; then
  USERNAME=$(gh api user --jq .login)
else
  USERNAME="$1"
fi

echo "🔍 检查 @$USERNAME 的分配任务..."
echo ""

# 获取分配给当前用户的 open issues
ISSUES=$(gh issue list \
  --repo "$REPO" \
  --state open \
  --assignee "$USERNAME" \
  --json number,title,labels,createdAt,updatedAt \
  --jq 'sort_by(.createdAt) | reverse')

# 检查是否有任务
ISSUE_COUNT=$(echo "$ISSUES" | jq 'length')

if [ "$ISSUE_COUNT" -eq 0 ]; then
  echo "✅ 暂无分配的任务"
  echo ""
  echo "💡 可以:"
  echo "   - 检查 P0/P1 高优先级任务"
  echo "   - 查看 backlog 中的任务"
  echo "   - 等待新任务分配"
  exit 0
fi

echo "📋 找到 $ISSUE_COUNT 个分配的任务:"
echo ""

# 显示任务列表
echo "$ISSUES" | jq -r '.[] | "  #\(.number) [\(.labels | map(.name) | join(", "))] \(.title)"'

echo ""
echo "📊 任务详情:"
echo ""

# 显示每个任务的详细信息
echo "$ISSUES" | jq -r '.[] | "### #\(.number) \(.title)\n  创建时间：\(.createdAt)\n  更新时间：\(.updatedAt)\n  标签：\(.labels | map(.name) | join(", "))\n"'

echo ""
echo "🔗 Issue 列表：https://github.com/$REPO/issues?q=is:open+assignee:$USERNAME"
echo ""

# 统计优先级分布
P0_COUNT=$(echo "$ISSUES" | jq '[.[] | select(.labels | map(.name) | contains(["priority:P0"]))] | length')
P1_COUNT=$(echo "$ISSUES" | jq '[.[] | select(.labels | map(.name) | contains(["priority:P1"]))] | length')
P2_COUNT=$(echo "$ISSUES" | jq '[.[] | select(.labels | map(.name) | contains(["priority:P2"]))] | length')
P3_COUNT=$(echo "$ISSUES" | jq '[.[] | select(.labels | map(.name) | contains(["priority:P3"]))] | length')

echo "📈 优先级分布:"
echo "  P0 (紧急): $P0_COUNT"
echo "  P1 (高):   $P1_COUNT"
echo "  P2 (中):   $P2_COUNT"
echo "  P3 (低):   $P3_COUNT"
echo ""

# 建议下一个要处理的任务
if [ "$P0_COUNT" -gt 0 ]; then
  echo "⚠️  建议优先处理 P0 紧急任务!"
elif [ "$P1_COUNT" -gt 0 ]; then
  echo "🔥 建议优先处理 P1 高优先级任务!"
else
  echo "✅ 按创建时间顺序处理任务"
fi

echo ""
echo "💡 使用以下命令查看任务详情:"
echo "   gh issue view <issue-number> --repo $REPO"
