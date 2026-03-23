#!/bin/bash

# Admin.tsx 修复脚本
# 修复 NaN 错误和添加分页功能

ADMIN_FILE="src/pages/Admin.tsx"

echo "🔧 开始修复 Admin.tsx..."

# 检查文件是否存在
if [ ! -f "$ADMIN_FILE" ]; then
    echo "❌ 文件不存在：$ADMIN_FILE"
    exit 1
fi

# 修复 NaN 错误 - 确保 products 是数组
sed -i '' 's/const totalProducts = products.length/const totalProducts = Array.isArray(products) ? products.length : 0/g' "$ADMIN_FILE"

# 添加分页状态
if ! grep -q "currentPage" "$ADMIN_FILE"; then
    sed -i '' '/const \[products, setProducts\]/a\  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 20;' "$ADMIN_FILE"
fi

echo "✅ Admin.tsx 修复完成"
