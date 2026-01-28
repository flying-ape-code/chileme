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

### 添加/更新推广链接

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
4. 粘贴到 `meals-data.json` 对应项的 `promoUrl` 字段

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
- 自动化数据获取（爬虫）
- 数据验证和错误处理
- 添加更多商品选项

## 开发记录

完成时间：2026年1月28日
开发者：Moltbot + OpenCode
任务状态：✅ 已完成
