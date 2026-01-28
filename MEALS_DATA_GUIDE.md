# 吃了么 - 美团推广链接功能

## 概述

已实现从 JSON 文件加载带推广链接的餐饮商品数据。转盘结果弹窗中会显示"去点餐"按钮，点击后跳转到美团商品页面。

## 实现方案

采用方案 A：手动维护 JSON 文件

### 新增文件

1. **meals-data.json** - 包含 5 类餐食数据，每项包含：
   - name: 餐食名称
   - img: 图片 URL（使用 Unsplash）
   - promoUrl: 美团推广链接

### 修改文件

1. **src/data.js**
   - 导入 `meals-data.json`
   - 将 `foodData` 指向导入的 JSON 数据
   - 保留原有的随机选择逻辑

2. **src/components/CelebrationModal.jsx**
   - 添加"去点餐"按钮
   - 当 food.promoUrl 存在时显示
   - 点击在新标签页打开推广链接

## 使用说明

### 方法 1：使用数据管理工具（推荐）

使用命令行工具方便地管理商品数据：

```bash
# 查看统计
node scripts/manage-meals.cjs stats

# 列出商品
node scripts/manage-meals.cjs list breakfast

# 添加商品（交互式）
node scripts/manage-meals.cjs add breakfast

# 删除商品
node scripts/manage-meals.cjs delete breakfast 3

# 导出为 CSV
node scripts/manage-meals.cjs export my-meals.csv

# 从 CSV 导入
node scripts/manage-meals.cjs import my-meals.csv

# 验证数据
node scripts/manage-meals.cjs validate
```

详细文档见：[scripts/README.md](scripts/README.md)

### 方法 2：手动编辑 JSON 文件

编辑 `meals-data.json` 文件，更新对应商品的 `promoUrl` 字段：

```json
{
  "breakfast": [
    {
      "name": "小笼包",
      "img": "https://...",
      "promoUrl": "https://i.meituan.com/..."  // 更新这里的链接
    }
  ]
}
```

### 获取美团推广链接步骤

1. 打开美团 App 或网页版
2. 找到目标商品/店铺
3. 复制链接（包含推广参数）
4. 使用工具添加或直接编辑 `meals-data.json` 对应项的 `promoUrl` 字段

### 数据结构

支持 5 类餐食：
- breakfast (早餐)
- lunch (午餐)
- afternoon-tea (下午茶)
- dinner (晚餐)
- night-snack (夜宵)

每类 6 个商品（可自由调整数量）

## 测试结果

✅ 项目构建成功
✅ JSON 数据加载正常
✅ 转盘功能正常
✅ "去点餐"按钮显示正确
✅ 推广链接跳转功能正常

## 未来改进

- 考虑添加饿了么数据支持
- 添加 Web 管理界面
- 支持数据版本管理和回滚
- 添加更多商品选项

## 开发记录

完成时间：2026年1月28日
开发者：Moltbot
任务状态：✅ 已完成

**更新记录：**
- ✅ 2026-01-28: 创建数据管理工具（scripts/manage-meals.cjs）
- ✅ 2026-01-28: 添加批量导入/导出功能（CSV 支持）
- ✅ 2026-01-28: 添加数据验证功能
- ✅ 2026-01-28: 自动备份机制
