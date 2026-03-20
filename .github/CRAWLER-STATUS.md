# 爬虫运行状态

**最后检查:** 2026-03-20 08:10
**配置状态:** ✅ 已启用

---

## ⚙️ 配置信息

**文件:** `crawler-config.json`

```json
{
  "enabled": true,
  "autoUpdate": true,
  "updateInterval": "0 * * * *"
}
```

**执行频率:** 每小时一次

---

## 📋 待执行步骤

### 1. 创建数据库表 ⏳

**操作:** 在 Supabase Dashboard 执行 SQL

**文件:** `supabase/migrations/003_create_meals_table.sql`

**步骤:**
1. 访问 https://supabase.com/dashboard/project/isefskqnkeesepcczbyo/sql/new
2. 复制 `003_create_meals_table.sql` 内容
3. 点击 Run 执行

### 2. 手动执行一次爬虫 ⏳

**命令:**
```bash
cd ~/chileme
npm run crawler
# 或
node scripts/crawler-meituan.js
```

### 3. 设置定时任务 ⏳

**方式 A:** 使用系统 cron
```bash
crontab -e
# 添加：0 * * * * cd ~/chileme && npm run crawler
```

**方式 B:** 使用 GitHub Actions
- 创建 `.github/workflows/crawler-daily.yml`
- 设置定时执行

---

## 📊 当前数据

**最后更新:** 2026-02-04 (需要更新)
**数据来源:** meals-data.json (静态文件)

**目标:** 
- 数据库存储
- 每小时自动更新
- CPS 链接自动生成

---

**状态:** 🟡 配置完成，待执行
