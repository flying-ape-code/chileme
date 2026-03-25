# GitHub Issues 任务管理指南

**版本:** 1.0  
**创建日期:** 2026-03-19  
**维护者:** Alex (main agent)

---

## 🎯 为什么使用 GitHub Issues

### 优势
- ✅ 原生支持任务追踪
- ✅ 支持标签、里程碑、指派
- ✅ 与代码提交关联
- ✅ 支持评论和讨论
- ✅ 所有 Agent 都能访问
- ✅ 移动端友好

### 对比文件管理
| 特性 | GitHub Issues | 文件管理 |
|------|--------------|---------|
| 任务状态 | ✅ 自动追踪 | ❌ 手动更新 |
| 任务分配 | ✅ 原生支持 | ❌ 文本标记 |
| 进度追踪 | ✅ 项目看板 | ❌ 手动维护 |
| 评论讨论 | ✅ 内置 | ❌ 需额外工具 |
| 代码关联 | ✅ 自动关联 | ❌ 手动链接 |
| 通知提醒 | ✅ 自动通知 | ❌ 需配置 |

---

## 🚀 快速开始

### 创建任务 (Issue)

**模板:**
```markdown
## 任务描述
[简要描述任务内容]

## 执行步骤
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

## 完成标准
- [ ] 标准 1
- [ ] 标准 2
- [ ] 标准 3

## 相关信息
- 项目：[项目名称]
- 优先级：P0/P1/P2
- 截止：YYYY-MM-DD
- 负责人：@agent
```

### 标签系统

| 标签 | 用途 | 示例 |
|------|------|------|
| `type:feature` | 新功能 | 用户反馈系统 |
| `type:bug` | Bug 修复 | 登录失败 |
| `type:enhancement` | 优化改进 | UI 优化 |
| `priority:P0` | 紧急 | 阻塞性 Bug |
| `priority:P1` | 高优先级 | 核心功能 |
| `priority:P2` | 中优先级 | 一般功能 |
| `status:in-progress` | 进行中 | - |
| `status:testing` | 测试中 | - |
| `status:done` | 已完成 | - |
| `agent:pm` | PM Agent | - |
| `agent:dev` | Dev Agent | - |
| `agent:test` | Test Agent | - |
| `agent:social` | Social Agent | - |

### 里程碑 (Milestones)

| 里程碑 | 用途 | 截止 |
|--------|------|------|
| `Phase 3 - 反馈系统` | 吃了么 Phase 3 | 2026-03-23 |
| `Phase 4 - 商业化` | 吃了么 Phase 4 | 2026-03-30 |
| `v2.5.0` | 版本发布 | 2026-03-20 |

---

## 📋 标准工作流程

### 1. 创建任务

```bash
# 使用 gh CLI 创建
gh issue create \
  --title "优化首页按钮布局" \
  --body-file task-template.md \
  --label "type:enhancement,priority:P2,agent:dev" \
  --milestone "Phase 3 - 反馈系统" \
  --assignee "dev-agent"
```

### 2. 分配任务

**Main Agent 分配:**
- 在 Issue 中 @对应 agent
- 添加对应标签 (agent:dev, agent:pm 等)
- 设置里程碑和优先级

### 3. 执行任务

**Agent 执行:**
1. 查看分配给自己的 Issues
2. 评论确认开始执行
3. 更新状态标签 (in-progress)
4. 提交代码时引用 Issue

```bash
# Git commit 引用 Issue
git commit -m "feat: 优化首页按钮布局

Closes #123"
```

### 4. 完成任务

**Agent 完成:**
1. 评论说明完成情况
2. 更新状态标签 (done)
3. 关闭 Issue
4. 通知 main agent

---

## 🔔 通知规则

### 任务分配
**Main Agent → 执行 Agent**
```
@dev 新任务分配：

#123 优化首页按钮布局
优先级：P2
截止：2026-03-20
链接：https://github.com/.../issues/123

请确认并开始执行。
```

### 任务完成
**执行 Agent → Main Agent**
```
@main 任务完成通知：

#123 优化首页按钮布局
状态：✅ 完成
部署：https://...
链接：https://github.com/.../issues/123

请验收。
```

### 遇到阻塞
**执行 Agent → Main Agent**
```
@main ⚠️ 任务阻塞：

#123 优化首页按钮布局
阻塞原因：[原因]
需要帮助：[需求]

请协调。
```

---

## 📊 任务看板

### GitHub Projects 看板

```
| To Do | In Progress | Testing | Done |
|-------|-------------|---------|------|
| #125  | #123        | #120    | #118 |
| #124  | #122        | #121    | #119 |
```

### 查看命令

```bash
# 查看所有 Issues
gh issue list

# 查看分配给自己的 Issues
gh issue list --assignee "@me"

# 查看特定标签的 Issues
gh issue list --label "priority:P0"

# 查看特定里程碑的 Issues
gh issue list --milestone "Phase 3"

# 查看 Issue 详情
gh issue view 123
```

---

## 🎯 各 Agent 职责

### Main Agent
- ✅ 创建和分配 Issues
- ✅ 设置标签和里程碑
- ✅ 追踪进度
- ✅ 协调阻塞问题
- ✅ 验收并关闭 Issues

### PM Agent
- ✅ 创建产品需求 Issues
- ✅ 编写 PRD (关联 Issue)
- ✅ 验收开发成果
- ✅ 更新 Issue 状态

### Dev Agent
- ✅ 查看分配的开发 Issues
- ✅ 评论确认开始
- ✅ 提交代码引用 Issue
- ✅ 完成后更新状态

### Test Agent
- ✅ 创建测试 Issues
- ✅ 执行测试 (关联 Issue)
- ✅ 提交测试报告
- ✅ 更新 Issue 状态

### Social Agent
- ✅ 创建内容 Issues
- ✅ 发布内容
- ✅ 关联发布链接
- ✅ 更新 Issue 状态

---

## 📁 项目结构

```
GitHub Project: 吃了么
├── Issues (任务)
│   ├── #123 优化首页按钮布局
│   ├── #122 用户反馈系统
│   └── ...
├── Projects (看板)
│   ├── Phase 3 - 反馈系统
│   └── Phase 4 - 商业化
├── Labels (标签)
│   ├── type:feature
│   ├── type:bug
│   ├── priority:P0/P1/P2
│   └── agent:pm/dev/test/social
└── Milestones (里程碑)
    ├── Phase 3 - 反馈系统 (2026-03-23)
    └── Phase 4 - 商业化 (2026-03-30)
```

---

## 🔧 工具配置

### gh CLI 配置

```bash
# 安装 gh CLI (macOS)
brew install gh

# 认证
gh auth login

# 验证
gh auth status
```

### 自动化脚本

```bash
# 创建任务
~/.openclaw/workspace/scripts/create-issue.sh

# 查看我的任务
~/.openclaw/workspace/scripts/my-issues.sh

# 更新任务状态
~/.openclaw/workspace/scripts/update-issue.sh
```

---

## 📖 最佳实践

### Issue 标题
- ✅ 清晰简洁
- ✅ 包含动词 (优化/修复/添加)
- ✅ 避免模糊描述

**好:** `feat: 优化首页按钮布局`  
**差:** `首页问题`

### Issue 描述
- ✅ 包含任务背景
- ✅ 列出执行步骤
- ✅ 明确完成标准
- ✅ 添加相关链接

### 标签使用
- ✅ 至少 1 个 type 标签
- ✅ 至少 1 个 priority 标签
- ✅ 至少 1 个 agent 标签
- ✅ 关联里程碑

### 评论更新
- ✅ 开始执行时评论
- ✅ 遇到困难时评论
- ✅ 阶段完成时评论
- ✅ 完成后评论总结

---

## 📊 统计指标

### 常用查询

```bash
# 本周完成 Issues
gh issue list --state closed --since "2026-03-13"

# 我的待办 Issues
gh issue list --assignee "@me" --state open

# 阻塞的 Issues
gh issue list --label "blocked"

# P0 紧急 Issues
gh issue list --label "priority:P0"
```

### 看板指标
- 开放 Issues 数
- 本周完成数
- 平均完成时间
- 阻塞 Issues 数

---

## 📞 问题排查

### Q: 如何批量创建 Issues？
**A:** 使用脚本或 GitHub 项目模板

### Q: 如何关联 Pull Request？
**A:** 在 PR 描述中引用 Issue (#123)

### Q: 如何设置自动关闭？
**A:** Commit message 包含 "Closes #123"

### Q: 如何查看进度？
**A:** 使用 GitHub Projects 看板

---

## 📝 模板示例

### 功能开发 Issue

```markdown
## 任务描述
开发用户反馈系统，包括提交反馈、查看反馈、管理后台。

## 执行步骤
1. 创建数据库表
2. 开发后端 API
3. 开发前端组件
4. 单元测试
5. 部署验证

## 完成标准
- [ ] 数据库表创建
- [ ] API 开发完成
- [ ] 前端组件完成
- [ ] 测试通过
- [ ] 部署成功

## 相关信息
- 项目：吃了么 Phase 3
- 优先级：P1
- 截止：2026-03-20
- 负责人：@dev-agent
- PRD: [链接]
```

### Bug 修复 Issue

```markdown
## Bug 描述
用户无法登录，点击登录按钮无响应。

## 复现步骤
1. 打开应用
2. 点击登录
3. 输入账号密码
4. 点击登录按钮
5. 无响应

## 期望行为
登录成功，跳转到首页

## 实际行为
登录按钮无响应，控制台报错

## 错误日志
```
Error: Network timeout
```

## 相关信息
- 优先级：P0
- 环境：生产环境
- 影响：所有用户
```

---

**维护者:** Alex (main agent)  
**最后更新:** 2026-03-19  
**下次审查:** 2026-04-19
