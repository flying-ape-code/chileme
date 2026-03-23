# Vercel CPS 配置指南

## 环境变量

在 Vercel Dashboard 添加以下环境变量：

### 生产环境 (Production)

```
VITE_DINGDANXIA_APIKEY=Ww9xkFpD8lfGswr4UleNjsQoxMHyeiWR
VITE_CPS_ENABLED=true
VITE_MEITUAN_POSITION_ID=shipinwaimai
VITE_MEITUAN_CHANNEL_ID=473920
```

### 预览环境 (Preview)

同上

### 开发环境 (Development)

```
VITE_DINGDANXIA_APIKEY=Ww9xkFpD8lfGswr4UleNjsQoxMHyeiWR
VITE_CPS_ENABLED=true
```

## 配置步骤

1. 访问 https://vercel.com/flying-ape-code/chileme/settings/environment-variables
2. 点击 "Add New"
3. 添加上述环境变量
4. 选择环境（Production/Preview/Development）
5. 保存

## 验证

部署后访问：https://chileme-five.vercel.app

点击商品卡片上的"去点餐"按钮，应该跳转到 CPS 推广链接。

## CPS 链接格式

美团联盟 CPS 链接格式：
```
https://i.meituan.com/cps/{position_id}/{goods_id}
```

示例：
```
https://i.meituan.com/cps/shipinwaimai/3a8fcd13-722a-4039-b758-7090bc0b30b5
```

---

**配置完成后请验证 CPS 链接是否正常工作！**
