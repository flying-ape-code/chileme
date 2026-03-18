# 吃了么 Phase 3 - 开发任务

**任务 ID:** CHILEME-DEV-003  
**创建时间:** 2026-03-18 16:35  
**优先级:** 🔴 高  
**预计工期:** 4.5 天  
**截止:** 2026-03-23

---

## 📋 任务概述

开发用户反馈系统，包括数据库设计、后端 API、前端用户端和管理后台。

**PRD 文档:** `workspace/chileme-phase3-prd.md`  
**UI 设计:** `workspace/output/chileme-phase3-ui/`  
**任务分解:** `workspace/chileme-phase3-tasks.md`

---

## 🎯 开发任务

### 阶段 1: 数据库和后端 (2 天)

**T01-T03: 数据库设计**
```sql
-- 创建 feedbacks 表
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- suggestion/complaint/other
  content TEXT NOT NULL,
  contact TEXT,
  status TEXT DEFAULT 'pending', -- pending/processing/resolved
  priority TEXT DEFAULT 'medium', -- high/medium/low
  admin_reply TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建 feedback_images 表
CREATE TABLE feedback_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES feedbacks(id),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建 RLS 策略
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的反馈
CREATE POLICY "Users can view own feedbacks"
  ON feedbacks FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以创建自己的反馈
CREATE POLICY "Users can create own feedbacks"
  ON feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 管理员可以查看所有反馈
CREATE POLICY "Admins can view all feedbacks"
  ON feedbacks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

**T04-T08: 后端 API**
- POST /api/feedbacks - 提交反馈
- GET /api/feedbacks - 获取反馈列表（管理员）
- GET /api/feedbacks/:id - 获取反馈详情
- PATCH /api/feedbacks/:id - 更新反馈状态/回复
- POST /api/feedbacks/images - 上传图片

**T09: 单元测试**
- API 测试
- 权限测试
- 图片上传测试

### 阶段 2: 前端用户端 (1 天)

**T11: 反馈入口组件**
- 位置："我的"页面
- 样式：参考 UI 设计图 `feedback-button.png`
- 功能：点击打开反馈表单

**T12: 反馈表单页面**
- 参考 UI 设计图 `feedback-form.png`
- 字段：反馈类型、反馈内容、联系方式、图片上传
- 验证：内容 10-500 字，图片最多 3 张

**T13: 图片上传功能**
- 支持拖拽上传
- 图片压缩（单张<5MB）
- 预览和删除

**T14: 我的反馈记录页面**
- 列表展示用户提交的反馈
- 显示状态（待处理/处理中/已解决）
- 显示管理员回复

### 阶段 3: 前端管理后台 (1.5 天)

**T21: 反馈管理列表页面**
- 参考 UI 设计图 `feedback-admin.png`
- 表格展示所有反馈
- 分页浏览

**T22: 筛选和排序功能**
- 按类型筛选
- 按状态筛选
- 按时间排序

**T23: 反馈详情和回复组件**
- 查看反馈完整内容
- 回复用户反馈
- 查看上传图片

**T24: 状态修改和优先级设置**
- 修改处理状态
- 设置优先级（高/中/低）

**T25: 反馈统计页面**
- 数量统计（按类型、状态）
- 趋势图（近 7 天/30 天）
- 热词云图

---

## ✅ 验收标准

### 代码质量
- [ ] 所有功能实现完成
- [ ] 单元测试通过
- [ ] 无 TypeScript 错误
- [ ] 代码符合项目规范

### 功能测试
- [ ] 用户可以提交反馈
- [ ] 用户可以上传图片
- [ ] 用户可以查看自己的反馈
- [ ] 管理员可以查看所有反馈
- [ ] 管理员可以回复反馈
- [ ] 管理员可以修改状态

### 编译运行
- [ ] `npm run build` 成功
- [ ] `npm run dev` 正常运行
- [ ] 生产环境打包正常

---

## 📁 相关文件

| 文件 | 位置 |
|------|------|
| PRD 文档 | `~/chileme/PHASE3-PRD-FEEDBACK.md` (复制) |
| UI 设计图 | `workspace/output/chileme-phase3-ui/` |
| 任务分解 | `workspace/chileme-phase3-tasks.md` |
| 开发文档 | `~/chileme/PHASE3-DEV-LOG.md` (新建) |

---

## 📝 开发日志

请在 `~/chileme/PHASE3-DEV-LOG.md` 记录每日开发进度：

```markdown
# Phase 3 开发日志

## Day 1 (2026-03-19)
- [ ] T01: 创建 feedbacks 表
- [ ] T02: 创建 feedback_images 表
- [ ] T03: 创建 RLS 策略

## Day 2 (2026-03-20)
- [ ] T04-T08: 后端 API 开发
- [ ] T09: 单元测试

## Day 3 (2026-03-21)
- [ ] T11-T14: 前端用户端开发

## Day 4 (2026-03-22)
- [ ] T21-T25: 前端管理后台开发

## Day 5 (2026-03-23)
- [ ] Bug 修复
- [ ] 优化
- [ ] 准备交付测试
```

---

**分配时间:** 2026-03-18 16:35  
**开始时间:** 立即  
**预计完成:** 2026-03-23

**完成后通知:** main agent
