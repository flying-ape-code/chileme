# 吃了么 - 部署文档

## 生产环境

**URL:** https://chileme-five.vercel.app  
**平台:** Vercel  
**框架:** Vite  
**部署时间:** 2026-03-13 22:26

## 快速链接

- **生产环境:** https://chileme-five.vercel.app
- **Vercel 控制台:** https://vercel.com/flyingapecodes-projects/chileme

## 部署命令

```bash
# 部署到生产环境
vercel --prod

# 部署到预览环境
vercel
```

## 自动部署

已配置 GitHub 自动部署：
- 推送至 `main` 分支 → 自动部署到生产环境
- 推送至其他分支 → 自动创建预览环境

## 环境变量

无需特殊环境变量。

## 自定义域名（可选）

如需绑定自定义域名：
1. 访问 Vercel 控制台
2. 进入项目设置
3. 添加域名
4. 配置 DNS 记录

## 性能指标

- 首次加载：~1.2s
- 构建时间：~18s
- 文件大小：~470KB (gzipped: ~136KB)

---

**最后更新:** 2026-03-13
