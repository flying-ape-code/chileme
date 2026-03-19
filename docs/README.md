# 📚 吃了么文档中心

---

## 📁 目录结构

```
docs/
├── README.md              # 本文档
├── archive/               # 历史归档
│   ├── BUG_FIX_REPORT.md
│   ├── DEPLOYMENT.md
│   ├── PHASE1_COMPLETE.md
│   └── ...
├── technical/             # 技术文档
│   ├── SUPABASE_INTEGRATION.md
│   ├── SUPABASE_SETUP.md
│   └── STORAGE-SETUP-INSTRUCTIONS.md
├── guides/                # 使用指南
│   └── MEALS_DATA_GUIDE.md
└── api/                   # API 文档（待添加）
```

---

## 🗂️ 文件分类

### 技术文档 (docs/technical/)
- **SUPABASE_INTEGRATION.md** - Supabase 集成指南
- **SUPABASE_SETUP.md** - Supabase 配置说明
- **STORAGE-SETUP-INSTRUCTIONS.md** - 存储配置说明

### 使用指南 (docs/guides/)
- **MEALS_DATA_GUIDE.md** - 商品数据指南

### 历史归档 (docs/archive/)
包含已完成项目的报告、测试文档、部署记录等。

---

## 📋 主目录文件说明

**核心配置:**
- `.env.example` - 环境变量模板
- `.env.local` - 本地配置（不提交）
- `.gitignore` - Git 忽略规则
- `README.md` - 项目说明
- `AGENTS.md` - Agent 工作说明

**GitHub 相关:**
- `GITHUB-SETUP-COMPLETE.md` - GitHub 配置完成报告
- `GITHUB-ISSUES-TASK-MANAGEMENT.md` - GitHub Issues 任务管理指南
- `GITHUB-ISSUE-TEMPLATES-GUIDE.md` - Issue 模板指南

**Phase 3 开发中:**
- `PHASE3-DEV-LOG.md` - 开发日志
- `PHASE3-PRD-FEEDBACK.md` - 需求文档
- `PHASE3-PROGRESS.md` - 进度看板
- `PHASE3-TEST-CASES.md` - 测试用例
- `PHASE3-TEST-REPORT.md` - 测试报告
- `PHASE3-TEST-REPORT-UNIT.md` - 单元测试报告
- `UNIT-TEST-SUMMARY.md` - 单元测试总结

---

## 🎯 文件管理原则

1. **主目录只保留核心文件** - 配置、源码、必要文档
2. **技术文档归档到 docs/** - 便于查找和维护
3. **历史报告统一归档** - 保持主目录整洁
4. **任务管理在 GitHub** - 使用 Issues 和 Projects

---

**最后更新:** 2026-03-19  
**清理后文件数:** 主目录 12 个 Markdown 文件（清理前 30+ 个）
