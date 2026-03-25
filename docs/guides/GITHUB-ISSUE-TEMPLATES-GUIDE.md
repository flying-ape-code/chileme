# GitHub Issue 模板使用指南

**项目:** 吃了么 (chileme)  
**创建日期:** 2026-03-19  
**维护者:** Alex (main agent)

---

## ✅ 已创建模板

| 模板 | 文件 | 用途 | 标签 |
|------|------|------|------|
| 🚀 功能需求 | `feature-request.md` | 新功能、产品改进 | `type:feature` |
| 🐛 Bug 报告 | `bug-report.md` | 错误报告、问题反馈 | `type:bug` |
| 📋 开发任务 | `task-template.md` | 标准开发任务 | `type:enhancement` |
| 🧪 测试任务 | `test-task.md` | 功能/性能/回归测试 | `type:testing` |

**位置:** `~/chileme/.github/ISSUE_TEMPLATE/`

---

## 🎯 使用场景

### 1. 🚀 功能需求
**何时使用:**
- 提出新功能想法
- 产品改进建议
- 用户需求收集

**示例:**
- "添加用户反馈系统"
- "优化首页加载速度"
- "支持微信登录"

**自动标签:** `type:feature`, `priority:P2`

---

### 2. 🐛 Bug 报告
**何时使用:**
- 发现程序错误
- 功能异常
- 用户体验问题

**示例:**
- "登录按钮点击无响应"
- "数据加载失败"
- "移动端布局错乱"

**自动标签:** `type:bug`, `priority:P1`

---

### 3. 📋 开发任务
**何时使用:**
- 标准开发工作
- 技术优化
- 重构任务

**示例:**
- "优化首页按钮布局"
- "迁移到 TypeScript"
- "添加单元测试"

**自动标签:** `type:enhancement`, `priority:P2`

---

### 4. 🧪 测试任务
**何时使用:**
- 功能测试
- 回归测试
- 性能测试

**示例:**
- "Phase 3 功能测试"
- "性能基准测试"
- "移动端兼容性测试"

**自动标签:** `type:testing`, `priority:P1`, `assignees: test-agent`

---

## 📋 模板结构

### 通用章节

所有模板都包含以下核心章节：

1. **描述部分** - 任务/问题背景
2. **详细信息** - 具体内容/步骤
3. **完成标准** - 验收条件
4. **相关文件** - 代码/文档链接
5. **相关人员** - 负责人分配
6. **时间线** - 关键时间点

---

## 🔧 配置说明

### config.yml

```yaml
blank_issues_enabled: true  # 允许创建空白 Issue
contact_links:
  - 任务管理指南链接
  - Discussions 链接
  - 联系方式
```

**位置:** `~/chileme/.github/ISSUE_TEMPLATE/config.yml`

---

## 🎯 最佳实践

### Issue 标题
✅ **好:**
- `[Feature] 添加用户反馈系统`
- `[Bug] 登录按钮点击无响应`
- `[Task] 优化首页按钮布局`
- `[Test] Phase 3 功能测试`

❌ **差:**
- `反馈功能`
- `有问题`
- `首页优化`
- `测试`

### 标签使用

**必须标签:**
- 至少 1 个 `type:*` 标签
- 至少 1 个 `priority:*` 标签

**推荐标签:**
- `agent:pm/dev/test/social` - 负责人
- `status:in-progress/testing/done` - 状态
- 里程碑 - 项目阶段

### 描述填写

✅ **好:**
- 背景清晰
- 步骤详细
- 期望明确
- 有截图/日志

❌ **差:**
- 描述模糊
- 缺少步骤
- 无参考信息

---

## 📊 工作流程

### 功能需求流程

```
1. 创建 Issue (feature-request.md)
       ↓
2. PM Agent 完善 PRD
       ↓
3. Main Agent 分配 Dev
       ↓
4. Dev Agent 开发
       ↓
5. Test Agent 测试
       ↓
6. PM Agent 验收
       ↓
7. 关闭 Issue
```

### Bug 修复流程

```
1. 创建 Issue (bug-report.md)
       ↓
2. 评估严重程度
       ↓
3. Dev Agent 修复
       ↓
4. Test Agent 验证
       ↓
5. 关闭 Issue
```

### 开发任务流程

```
1. 创建 Issue (task-template.md)
       ↓
2. Dev Agent 执行
       ↓
3. 提交代码 (Closes #123)
       ↓
4. Test Agent 验证
       ↓
5. 关闭 Issue
```

### 测试任务流程

```
1. 创建 Issue (test-task.md)
       ↓
2. Test Agent 执行测试
       ↓
3. 提交测试报告
       ↓
4. Dev Agent 修复问题
       ↓
5. 关闭 Issue
```

---

## 🔗 代码关联

### Commit Message

```bash
# 关闭 Issue
git commit -m "feat: 添加用户反馈系统

Closes #123"

# 关联 Issue
git commit -m "fix: 修复登录问题

Related to #456"

# 修复多个 Issue
git commit -m "feat: 首页优化

Closes #123, #456, #789"
```

### Pull Request

在 PR 描述中引用 Issue:
```markdown
## 相关 Issue
Closes #123

## 变更说明
- 添加反馈组件
- 开发后端 API
- 编写单元测试
```

---

## 📎 示例

### 功能需求示例

```markdown
---
name: 🚀 功能需求
title: "[Feature] 添加用户反馈系统"
labels: ["type:feature", "priority:P1"]
assignees: ["pm-agent"]
---

## 📋 需求描述

**背景：**
用户无法提交反馈，缺少反馈渠道。

**目标：**
建立完整的用户反馈系统，包括提交、查看、管理。

## ✅ 验收标准

- [ ] 用户可以提交反馈
- [ ] 管理员可以查看反馈
- [ ] 支持图片上传
- [ ] 支持状态跟踪
```

### Bug 报告示例

```markdown
---
name: 🐛 Bug 报告
title: "[Bug] 登录按钮点击无响应"
labels: ["type:bug", "priority:P0"]
assignees: ["dev-agent"]
---

## 🔁 复现步骤

1. 打开首页
2. 点击登录按钮
3. 无响应

## ❌ 实际行为

控制台报错：`Network timeout`

## ✅ 期望行为

弹出登录表单
```

---

## 📖 相关文档

| 文档 | 链接 |
|------|------|
| 任务管理指南 | `GITHUB-ISSUES-TASK-MANAGEMENT.md` |
| Agent 协作框架 | `AGENT-COORDINATION.md` |
| 快速指南 | `AGENT-TASK-QUICK-GUIDE.md` |

---

## 🛠️ 维护

### 添加新模板

1. 在 `.github/ISSUE_TEMPLATE/` 创建新文件
2. 使用 Front Matter 配置
3. 更新本文档

### 更新模板

1. 修改对应模板文件
2. 更新本文档
3. 通知所有 Agent

### 标签管理

在 GitHub 仓库设置中标签：
```
Settings → Labels
├── type:feature (蓝色)
├── type:bug (红色)
├── type:enhancement (绿色)
├── type:testing (紫色)
├── priority:P0 (红色)
├── priority:P1 (橙色)
├── priority:P2 (黄色)
└── agent:pm/dev/test/social (蓝色)
```

---

**维护者:** Alex (main agent)  
**最后更新:** 2026-03-19  
**下次审查:** 2026-04-19
