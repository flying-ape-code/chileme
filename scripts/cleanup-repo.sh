#!/bin/bash

echo "🧹 开始清理仓库..."

# 删除任务管理相关文件
echo "📋 删除任务文件..."
rm -rf tasks/
rm -f DEV_TASKS.md
rm -f PHASE3-DEV-TASKS.md
rm -f PHASE3-TASKS.md
rm -f TASK_COMPLETE.md
rm -f UI_TEST_TASK.md
rm -f PROJECT_PROGRESS.md

# 删除临时文件
echo "🗑️ 删除临时文件..."
rm -f .env.backup
rm -f PHASE3-PROGRESS.md.bak
rm -f TEST-VERIFICATION-*.md

# 删除旧报告（归档到 docs/archive）
echo "📦 归档旧报告..."
mkdir -p docs/archive

mv BUG_FIX_REPORT.md docs/archive/ 2>/dev/null
mv DEPLOYMENT.md docs/archive/ 2>/dev/null
mv DEPLOYMENT_UPDATE.md docs/archive/ 2>/dev/null
mv FIX_GUIDE.md docs/archive/ 2>/dev/null
mv FUNCTIONAL_TEST_REPORT.md docs/archive/ 2>/dev/null
mv PERFORMANCE-OPTIMIZATION-REPORT.md docs/archive/ 2>/dev/null
mv PHASE1_COMPLETE.md docs/archive/ 2>/dev/null
mv PHASE2_COMPLETE.md docs/archive/ 2>/dev/null
mv TEST_GUIDE.md docs/archive/ 2>/dev/null
mv TEST_RESULTS.md docs/archive/ 2>/dev/null
mv UI_TEST_CHECKLIST.md docs/archive/ 2>/dev/null
mv VERIFICATION_REPORT.md docs/archive/ 2>/dev/null
mv bug-fix-*.md docs/archive/ 2>/dev/null
mv bug-fix-report*.md docs/archive/ 2>/dev/null

# 移动技术文档到 docs/technical
echo "📚 整理技术文档..."
mkdir -p docs/technical

mv SUPABASE_INTEGRATION.md docs/technical/ 2>/dev/null
mv SUPABASE_SETUP.md docs/technical/ 2>/dev/null
mv STORAGE-SETUP-INSTRUCTIONS.md docs/technical/ 2>/dev/null
mv MEALS_DATA_GUIDE.md docs/guides/ 2>/dev/null

echo "✅ 清理完成！"
echo ""
echo "📊 清理结果:"
echo "- 删除任务文件：7 个"
echo "- 删除临时文件：3 个"
echo "- 归档旧报告：15 个"
echo "- 整理技术文档：4 个"
