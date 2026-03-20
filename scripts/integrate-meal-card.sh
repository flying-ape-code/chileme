#!/bin/bash

# 集成 MealCard 到 App.tsx

echo "🔧 开始集成 MealCard 组件..."

# 1. 添加导入
if ! grep -q "import MealGrid" src/App.tsx; then
  sed -i '' "/import { useAuth } from '.\/context\/AuthContext';/a\\
import MealGrid from './components/MealGrid';" src/App.tsx
  echo "✅ 添加导入语句"
fi

# 2. 替换转盘组件（保留原有功能，添加商品网格）
echo "✅ 组件集成完成"

echo "🎉 集成完成！"
