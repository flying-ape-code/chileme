# 仓库清理计划

**时间:** 2026-03-19 20:05
**目标:** 清理本地任务文件，整理仓库结构

---

## 🗑️ 需要删除的文件

### 任务管理相关（已迁移到 GitHub Issues）
- [ ] tasks/ 目录
- [ ] DEV_TASKS.md
- [ ] PHASE3-DEV-TASKS.md
- [ ] PHASE3-TASKS.md
- [ ] TASK_COMPLETE.md
- [ ] UI_TEST_TASK.md
- [ ] PROJECT_PROGRESS.md

### 临时文件
- [ ] .env.backup
- [ ] PHASE3-PROGRESS.md.bak
- [ ] bug-fix-*.md (已解决的 bug)
- [ ] TEST-VERIFICATION-*.md

### 旧报告（已归档）
- [ ] BUG_FIX_REPORT.md
- [ ] DEPLOYMENT.md
- [ ] DEPLOYMENT_UPDATE.md
- [ ] FIX_GUIDE.md
- [ ] FUNCTIONAL_TEST_REPORT.md
- [ ] PERFORMANCE-OPTIMIZATION-REPORT.md
- [ ] PHASE1_COMPLETE.md
- [ ] PHASE2_COMPLETE.md
- [ ] TEST_GUIDE.md
- [ ] TEST_RESULTS.md
- [ ] UI_TEST_CHECKLIST.md
- [ ] VERIFICATION_REPORT.md

---

## 📁 保留的核心文件

### 必要配置
- ✅ .env.example (环境变量模板)
- ✅ .env.local (本地配置)
- ✅ .gitignore
- ✅ README.md
- ✅ AGENTS.md

### 技术文档
- ✅ SUPABASE_INTEGRATION.md
- ✅ SUPABASE_SETUP.md
- ✅ MEALS_DATA_GUIDE.md
- ✅ STORAGE-SETUP-INSTRUCTIONS.md

### Phase 3 相关（进行中）
- ✅ PHASE3-PRD-FEEDBACK.md
- ✅ PHASE3-PROGRESS.md
- ✅ PHASE3-DEV-LOG.md
- ✅ PHASE3-TEST-CASES.md
- ✅ PHASE3-TEST-REPORT.md
- ✅ PHASE3-TEST-REPORT-UNIT.md
- ✅ UNIT-TEST-SUMMARY.md

### GitHub 相关（新）
- ✅ GITHUB-SETUP-COMPLETE.md
- ✅ GITHUB-ISSUES-TASK-MANAGEMENT.md
- ✅ GITHUB-ISSUE-TEMPLATES-GUIDE.md

---

## 📂 目录结构优化

### 创建 docs/ 目录
```
docs/
├── api/              # API 文档
├── guides/           # 使用指南
├── technical/        # 技术文档
└── archive/          # 历史归档
```

### 移动文件
- 技术文档 → docs/technical/
- 使用指南 → docs/guides/
- 历史报告 → docs/archive/

---

## ✅ 清理后效果

**主目录文件数:** 30+ → 10 个以内
**结构清晰:** 配置、源码、文档分离
**易于维护:** 只保留必要文件

---

**执行时间:** 预计 10 分钟
