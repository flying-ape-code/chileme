#!/bin/bash
# create-github-task.sh - 创建 GitHub Issue 并分配给指定 Agent
# 用法：./create-github-task.sh <title> <assignee> <priority> <description>

set -e

REPO="flying-ape-code/chileme"

# 参数检查
if [ $# -lt 2 ]; then
    echo "用法：$0 <title> <assignee> [priority] [description]"
    echo ""
    echo "参数:"
    echo "  title       - 任务标题"
    echo "  assignee    - 分配给谁 (GitHub username)"
    echo "  priority    - 优先级 (P0/P1/P2/P3, 默认 P2)"
    echo "  description - 任务描述 (可选)"
    echo ""
    echo "示例:"
    echo "  $0 \"修复登录 bug\" flying-ape-code P1 \"用户无法登录\""
    exit 1
fi

TITLE="$1"
ASSIGNEE="$2"
PRIORITY="${3:-P2}"
DESCRIPTION="${4:-}"

# 根据优先级设置 label
case "$PRIORITY" in
  P0)
    LABEL="priority:P0"
    ;;
  P1)
    LABEL="priority:P1"
    ;;
  P2)
    LABEL="priority:P2"
    ;;
  P3)
    LABEL="priority:P3"
    ;;
  *)
    echo "错误：优先级必须是 P0/P1/P2/P3"
    exit 1
    ;;
esac

echo "📋 创建 GitHub Issue..."
echo "  仓库：$REPO"
echo "  标题：$TITLE"
echo "  分配：@$ASSIGNEE"
echo "  优先级：$PRIORITY ($LABEL)"

# 构建 Issue 内容
BODY="## 📋 任务描述

$DESCRIPTION

---

## 🎯 执行步骤

### 1. 任务分析
- [ ] 理解需求
- [ ] 技术方案设计
- [ ] 工作量评估

### 2. 开发实现
- [ ] 编码实现
- [ ] 单元测试
- [ ] 代码审查

### 3. 测试验证
- [ ] 功能测试
- [ ] 集成测试
- [ ] 部署验证

---

## ✅ 完成标准

- [ ] 功能开发完成
- [ ] 代码审查通过
- [ ] 测试通过
- [ ] 部署验证通过

---

## 📊 进度追踪

- **创建时间:** $(date '+%Y-%m-%d %H:%M')
- **分配给:** @$ASSIGNEE
- **优先级:** $PRIORITY
- **状态:** Open

---

**自动创建:** GitHub Task Dispatch System
"

# 创建 Issue
ISSUE_URL=$(gh issue create \
  --repo "$REPO" \
  --title "$TITLE" \
  --body "$BODY" \
  --assignee "$ASSIGNEE" \
  --label "$LABEL" \
  --label "type:task" \
  | grep -o 'https://github.com[^ ]*')

echo ""
echo "✅ Issue 创建成功!"
echo "   $ISSUE_URL"

# 通知分配（可选：通过 Telegram 或其他方式）
echo ""
echo "🔔 通知 @$ASSIGNEE 查看任务"
# 这里可以添加 Telegram 通知逻辑

# 记录到本地日志
LOG_FILE="$(dirname "$0")/../logs/task-dispatch.log"
mkdir -p "$(dirname "$LOG_FILE")"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 创建任务：$ISSUE_URL - $TITLE (分配给 @$ASSIGNEE, 优先级 $PRIORITY)" >> "$LOG_FILE"

echo ""
echo "📝 日志已记录：$LOG_FILE"
