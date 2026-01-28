# 吃了么 - 数据管理工具

## 概述

`manage-meals.cjs` 是一个命令行工具，用于方便地管理 `meals-data.json` 中的餐饮商品数据。

## 功能

- ✅ 查看数据统计信息
- ✅ 列出所有或特定类别的商品
- ✅ 交互式添加新商品
- ✅ 删除商品
- ✅ 导出数据为 CSV
- ✅ 从 CSV 批量导入数据
- ✅ 验证数据完整性

## 使用方法

### 1. 查看统计信息

```bash
node scripts/manage-meals.cjs stats
```

输出示例：
```
📊 数据统计:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  早餐 (breakfast): 6 个商品
  午餐 (lunch): 6 个商品
  下午茶 (afternoon-tea): 6 个商品
  晚餐 (dinner): 6 个商品
  夜宵 (night-snack): 6 个商品
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  总计: 30 个商品
```

### 2. 列出商品

列出所有商品：
```bash
node scripts/manage-meals.cjs list
```

列出特定类别：
```bash
node scripts/manage-meals.cjs list breakfast
node scripts/manage-meals.cjs list lunch
node scripts/manage-meals.cjs list afternoon-tea
node scripts/manage-meals.cjs list dinner
node scripts/manage-meals.cjs list night-snack
```

### 3. 添加商品（交互式）

```bash
node scripts/manage-meals.cjs add <category>
```

示例：
```bash
node scripts/manage-meals.cjs add breakfast
```

然后按提示输入商品信息：
```
➕ 添加商品到 早餐

商品名称: 豆浆油条
图片 URL: https://images.unsplash.com/photo-xxx
推广链接 (美团): https://i.meituan.com/xxx

✅ 已添加商品: 豆浆油条
```

### 4. 删除商品

```bash
node scripts/manage-meals.cjs delete <category> <index>
```

示例（删除早餐列表的第3个商品）：
```bash
node scripts/manage-meals.cjs delete breakfast 3
```

**注意：** index 是从 1 开始的（显示顺序）。

### 5. 导出为 CSV

```bash
node scripts/manage-meals.cjs export [filename]
```

示例：
```bash
node scripts/manage-meals.cjs export
# 默认导出到 meals-export.csv

node scripts/manage-meals.cjs export my-meals.csv
# 导出到 my-meals.csv
```

CSV 格式：
```csv
category,categoryKey,name,img,promoUrl
早餐,breakfast,"小笼包",https://images.unsplash.com/...,https://i.meituan.com/...
早餐,breakfast,"煎饼果子",https://images.unsplash.com/...,https://i.meituan.com/...
...
```

### 6. 从 CSV 导入

```bash
node scripts/manage-meals.cjs import <filename>
```

示例：
```bash
node scripts/manage-meals.cjs import my-meals.csv
```

输出：
```
✅ 导入完成:
   成功导入: 15 条
   跳过: 2 条
```

### 7. 验证数据

```bash
node scripts/manage-meals.cjs validate
```

输出示例：
```
🔍 数据验证:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️  早餐[3]: 图片 URL 无效
  ❌  午餐[5]: 缺少名称
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ❌ 发现 1 个错误, 1 个警告
```

## 数据备份

每次修改数据前，工具会自动创建一个备份文件：
```
meals-data-backup-1738080000000.json
```

备份文件命名格式：`meals-data-backup-{timestamp}.json`

## 商品类别

- `breakfast` - 早餐
- `lunch` - 午餐
- `afternoon-tea` - 下午茶
- `dinner` - 晚餐
- `night-snack` - 夜宵

## 数据结构

每个商品包含三个字段：

```json
{
  "name": "商品名称",
  "img": "图片 URL (建议使用 Unsplash)",
  "promoUrl": "美团推广链接"
}
```

## 工作流程示例

### 场景 1：批量添加新商品

1. 准备 CSV 文件（可以用 Excel 编辑，然后导出为 CSV）
2. 运行导入：
   ```bash
   node scripts/manage-meals.cjs import new-meals.csv
   ```
3. 验证数据：
   ```bash
   node scripts/manage-meals.cjs validate
   ```
4. 测试转盘功能：
   ```bash
   npm run dev
   ```

### 场景 2：更新推广链接

1. 列出需要更新的类别：
   ```bash
   node scripts/manage-meals.cjs list lunch
   ```
2. 记住要更新的商品索引
3. 删除旧商品：
   ```bash
   node scripts/manage-meals.cjs delete lunch 2
   ```
4. 添加新商品（使用新链接）：
   ```bash
   node scripts/manage-meals.cjs add lunch
   ```
5. 验证：
   ```bash
   node scripts/manage-meals.cjs validate
   ```

### 场景 3：快速添加单个商品

```bash
# 添加到晚餐类别
node scripts/manage-meals.cjs add dinner
```

按提示输入信息即可。

## 注意事项

1. **备份：** 每次修改都会自动备份，可以在出问题时恢复
2. **验证：** 修改后建议运行 `validate` 检查数据完整性
3. **测试：** 修改数据后记得测试转盘功能
4. **Git 提交：** 确认无误后提交代码：
   ```bash
   git add meals-data.json
   git commit -m "更新餐饮商品数据"
   git push
   ```

## 获取美团推广链接

1. 打开美团 App 或网页版
2. 找到目标商品/店铺
3. 复制链接（确保包含推广参数）
4. 粘贴到 `meals-data.json` 或使用本工具添加

## 技术说明

- 工具会自动创建备份
- 支持交互式和命令行两种模式
- CSV 导入/导出便于批量操作
- 数据验证确保格式正确
