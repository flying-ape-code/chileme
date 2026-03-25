# CPS 链接问题诊断报告

**时间:** 2026-03-25 10:12
**Issue:** #31 #32

---

## 问题描述

CPS 链接 10/10 返回 HTTP 404

---

## 已测试的链接格式

### 1. 带 goods_id 的链接 ❌
```
https://u.meituan.com/cps/promotion?position_id=shipinwaimai&goods_id={UUID}&channel_id=473920
```
**结果:** HTTP 404
**原因:** UUID 不是美团商品 ID

### 2. 推广位链接 ❌
```
https://u.meituan.com/cps/promotion?position_id=shipinwaimai&channel_id=473920
```
**结果:** HTTP 404
**可能原因:** 推广位 ID 或渠道 ID 无效

### 3. 其他格式 ❌
- `https://u.meituan.com/cps/shipinwaimai` - 404
- `https://u.meituan.com/cps/miniapp?...` - 404

---

## 根本原因

**配置参数可能无效:**
- `VITE_MEITUAN_POSITION_ID=shipinwaimai`
- `VITE_MEITUAN_CHANNEL_ID=473920`

**需要确认:**
1. 订单侠 API Key 是否有效
2. 是否需要在美团联盟后台注册推广位
3. 推广位 ID 和渠道 ID 是否正确

---

## 解决方案

### 方案 1: 使用订单侠 API（推荐）

调用订单侠 API 生成真实有效的 CPS 链接：
```typescript
const response = await fetch('https://api.dingdanxia.com/api/cps/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apikey: 'Ww9xkFpD8lfGswr4UleNjsQoxMHyeiWR',
    type: 'meituan',
    position_id: 'shipinwaimai',
    channel_id: '473920'
  })
});
```

### 方案 2: 确认美团联盟配置

1. 登录美团联盟后台
2. 确认推广位 ID
3. 确认渠道 ID
4. 更新 .env.local 配置

---

## 下一步

1. 联系订单侠确认 API Key 有效性
2. 联系美团联盟确认推广位配置
3. 获取正确的 CPS 链接格式

---

**更新时间:** 2026-03-25 10:12
