# 吃了么项目结构

## 当前文件结构

### src/
- App.tsx - 主应用组件
- main.tsx - 入口文件
- index.css - 全局样式
- data.ts - 数据服务
- history.ts - 历史记录服务

### src/components/
- Wheel.tsx - 转盘组件
- CelebrationModal.tsx - 庆祝弹窗
- SettingsModal.tsx - 设置弹窗
- ShareModal.tsx - 分享弹窗
- History.tsx - 历史记录
- WeatherInsight.tsx - 天气组件
- Feedback/ - 反馈相关组件
- Auth/ - 认证相关组件

### src/pages/
- Admin.tsx - 管理后台
- Login.tsx - 登录页
- Register.tsx - 注册页
- MyFeedbacks.tsx - 我的反馈
- FeedbackAdmin.tsx - 反馈管理
- FeedbackStats.tsx - 反馈统计

### src/lib/
- supabaseClient.ts - Supabase 客户端
- auth.ts - 认证服务
- settings.ts - 设置服务
- share.ts - 分享服务
- spinService.ts - 转盘服务
- userService.ts - 用户服务

### src/context/
- AuthContext.tsx - 认证上下文

### src/utils/
- auth.ts - 认证工具

## 问题识别

1. **文件混乱** - 根目录太多文件
2. **重复文件** - 可能存在重复的 Admin.tsx
3. **未使用文件** - 需要清理

## 建议的目录结构

```
src/
├── main.tsx          # 入口
├── App.tsx           # 主应用
├── index.css         # 全局样式
├── components/       # 组件
│   ├── common/       # 通用组件
│   ├── feedback/     # 反馈组件
│   └── auth/         # 认证组件
├── pages/            # 页面
│   ├── admin/        # 管理后台
│   ├── auth/         # 认证页面
│   └── feedback/     # 反馈页面
├── services/         # 服务层
│   ├── supabase.ts
│   ├── auth.ts
│   └── ...
├── hooks/            # 自定义 Hooks
├── context/          # Context
├── utils/            # 工具函数
└── types/            # TypeScript 类型
```

## 需要清理的文件

- 根目录的临时文件
- 未使用的组件
- 重复的服务

---

**更新时间:** 2026-03-24
