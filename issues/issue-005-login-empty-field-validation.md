# Issue: 登录表单验证失败 - 空字段未显示错误提示

**Issue ID:** 005
**Created:** 2026-03-11 23:50
**Status:** ✅ Fixed
**Fixed Date:** 2026-03-12 00:30

---

## 🔍 Bug Description

在登录页面，当用户名/邮箱字段或密码字段为空时，点击"登录"按钮没有显示错误提示，页面没有任何响应，用户无法知道为什么无法登录。

---

## 📋 Steps to Reproduce

1. 访问 http://localhost:5173/login
2. 用户名/邮箱输入: `(留空)`
3. 密码输入: `test123` 或 `(留空)`
4. 点击"登录"按钮

---

## 🎯 Expected Behavior

应该显示错误提示："请输入用户名/邮箱和密码"，并阻止登录提交。

---

## ❌ Actual Behavior

没有显示任何错误提示，页面无响应，用户不知道发生了什么，也不知道为什么无法登录。

---

## 🖼️ Screenshots

无截图

---

## 🌐 Environment

- **Browser:** Chrome (via OpenClaw browser control)
- **URL:** http://localhost:5173/login
- **User State:** Not logged in
- **Console Errors:** 无

---

## 🏷️ Labels

- [x] Bug
- [x] UI
- [x] Functionality
- [x] Auth
- [ ] Database

---

## 💬 Notes

前端的登录表单验证逻辑可能未正确实现空字段验证。建议检查：
1. 登录表单的 onSubmit 验证函数
2. 用户名/邮箱和密码字段的 required 属性或验证逻辑
3. 错误提示显示组件的实现

这与注册表单的验证问题类似（Issue #001, #002, #003），建议统一检查所有表单验证逻辑的实现。
