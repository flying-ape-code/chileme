#!/bin/bash

# 自动执行 SQL 创建 meals 表
# 使用 Supabase CLI 或直接通过 API

SUPABASE_PROJECT="isefskqnkeesepcczbyo"
SQL_FILE="supabase/migrations/003_create_meals_table.sql"

echo "🚀 开始执行 SQL..."

# 检查 Supabase CLI
if command -v supabase &> /dev/null; then
    echo "✅ 使用 Supabase CLI"
    supabase db push --db-url "$DATABASE_URL"
    exit 0
fi

# 使用 curl 通过 Management API
echo "⚠️  Supabase CLI 未安装，尝试通过 API..."

# 读取 SQL 文件
SQL=$(cat "$SQL_FILE")

# 通过 Management API 执行（需要 API key）
echo "📝 请手动执行或使用 Dashboard:"
echo "https://supabase.com/dashboard/project/$SUPABASE_PROJECT/sql/new"

exit 1
