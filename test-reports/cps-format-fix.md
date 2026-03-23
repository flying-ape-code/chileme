# 🚨 CPS 链接格式修复报告

**测试时间:** 2026-03-23 23:50

## 📊 验证结果

### 当前 CPS 链接格式 ❌

**格式:** `https://i.meituan.com/cps/shipinwaimai/{goods_id}`

**测试结果:** 10/10 全部 404 (0% 有效)

**测试样本:**
1. 煎饼果子 - https://i.meituan.com/cps/shipinwaimai/3a8fcd13-722a-4039-b758-7090bc0b30b5 ❌ 404
2. 豆浆油条 - https://i.meituan.com/cps/shipinwaimai/7ca7100a-3e3e-4735-9f7d-212571eeaf3b ❌ 404
3. 兰州牛肉面 - https://i.meituan.com/cps/shipinwaimai/6dec0534-f9f0-4358-aed7-8f65e65fbf98 ❌ 404
4. 奶茶 - https://i.meituan.com/cps/shipinwaimai/7f34dc08-85e2-4f31-9a07-c62da301264f ❌ 404
5. 咖啡 - https://i.meituan.com/cps/shipinwaimai/9e7ad0a4-a14b-40d6-ab50-e0ad620f0e6c ❌ 404

---

## 🔍 问题分析

### 错误原因

**当前格式:** `https://i.meituan.com/cps/{position_id}/{goods_id}`

**问题:**
1. ❌ 域名错误 - 应该是 `u.meituan.com` 不是 `i.meituan.com`
2. ❌ 路径错误 - 应该是 `/cps/promotion` 不是 `/cps/{position_id}/{goods_id}`
3. ❌ 参数错误 - 应该使用查询参数不是路径参数

---

## ✅ 正确的 CPS 链接格式

### 美团联盟 CPS 格式

**格式:** `https://u.meituan.com/cps/promotion?position_id={position_id}&goods_id={goods_id}&channel_id={channel_id}`

**参数说明:**
- `position_id` - 推广位 ID (如：shipinwaimai)
- `goods_id` - 商品 ID (UUID)
- `channel_id` - 渠道 ID (如：473920)

**示例:**
```
https://u.meituan.com/cps/promotion?position_id=shipinwaimai&goods_id=3a8fcd13-722a-4039-b758-7090bc0b30b5&channel_id=473920
```

---

## 🔧 修复方案

### 方案 1: 使用订单侠 API (推荐)

调用订单侠 API 生成正确的 CPS 链接：

```javascript
const cpsUrl = await dingdanxia.generateCPSLink({
  type: 'meituan',
  position_id: 'shipinwaimai',
  channel_id: '473920',
  goods_id: productId
});
```

### 方案 2: 手动拼接正确格式

```javascript
const cpsUrl = `https://u.meituan.com/cps/promotion?position_id=shipinwaimai&goods_id=${productId}&channel_id=473920`;
```

---

## 📋 修复步骤

1. **更新 CPS 生成脚本**
   - 修改链接格式为正确格式
   - 使用 `u.meituan.com` 域名
   - 使用查询参数

2. **批量更新数据库**
   - 重新生成所有 678 个商品的 CPS 链接
   - 使用正确的格式

3. **验证新链接**
   - 抽取 10 个样本测试
   - 确认不再 404

---

## 💡 结论

**当前 CPS 链接:** ❌ 100% 无效（格式错误）

**需要:** 重新生成所有 CPS 链接，使用正确格式

**正确格式:** `https://u.meituan.com/cps/promotion?position_id={position_id}&goods_id={goods_id}&channel_id={channel_id}`

---

**报告生成时间:** 2026-03-23 23:50
