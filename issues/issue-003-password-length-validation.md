# Issue: 注册表单验证失败 - 密码长度不足未显示错误提示

**Issue ID:** 003
**Created:** 2026-03-11 23:50
**Status:** ✅ Fixed
**Fixed Date:** 2026-03-12 00:30

---

## 🔍 Bug Description

在注册页面，当输入的密码长度不足 6 位时（如 "123"），点击注册按钮没有显示错误提示，页面没有任何响应，用户无法知道为什么无法注册。

---

## 📋 Steps to Reproduce

1. 访问 http://localhost:5173/register
2. 用户名输入: `test2`
3. 邮箱输入: `test2@example.com`
4. 密码输入: `123` (长度不足 6 位)
5. 确认密码输入: `123`
6. 点击"注册"按钮

---

## 🎯 Expected Behavior

应该显示错误提示："密码至少需要 6 个字符"，并阻止注册提交。

---

## ❌ Actual Behavior

没有显示任何错误提示，页面无响应，用户不知道发生了什么，也不知道为什么无法注册。

---

## 🖼️ Screenshots

无截图

---

## 🌐 Environment

- **Browser:** Chrome (via OpenClaw browser control)
- **URL:** http://localhost:5173/register
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

前端的表单验证逻辑可能未正确实现密码长度验证。建议检查：
1. 注册表单的 onSubmit 验证函数
2. 密码字段的 minLength 属性或自定义验证函数
3. 错误提示显示组件的实现

其他表单验证（如密码不匹配）正常工作，说明错误提示组件本身是可以正常显示的。

注意：密码字段的 placeholder 显示"输入密码（至少 6 位）"，说明需求已经定义了密码长度的要求，只是验证逻辑未实现。
