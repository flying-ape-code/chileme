# 吃了么 - 商品数据爬虫定时任务配置
# 添加到 OpenClaw 心跳配置或系统 crontab

## 方案一：OpenClaw 心跳任务（推荐）

在 `HEARTBEAT.md` 中添加：

```markdown
### 商品数据爬虫
- [ ] 每日 3:00 AM 执行商品数据爬虫
- [ ] 脚本：`projects/chileme-code/scripts/crawler-daily.sh`
- [ ] 验证数据完整性
- [ ] 备份旧数据
```

## 方案二：系统 Crontab

```bash
# 编辑 crontab
crontab -e

# 添加以下行
# 吃了么商品数据爬虫 - 每天凌晨 3:00
0 3 * * * cd /Users/robin/.openclaw/workspace/projects/chileme-code && ./scripts/crawler-daily.sh >> /Users/robin/.openclaw/workspace/logs/crawler-daily.log 2>&1

# 验证 crontab
crontab -l
```

## 方案三：Node.js 调度器

使用项目现有的 `scripts/scheduler.js`：

```javascript
// 添加到 scheduler.js
const cron = require('node-cron');

// 每天 3:00 AM 执行爬虫
cron.schedule('0 3 * * *', () => {
  console.log('执行商品数据爬虫...');
  const { exec } = require('child_process');
  exec('node scripts/crawler-products.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`爬虫执行失败：${error}`);
      return;
    }
    console.log(`爬虫完成：${stdout}`);
  });
});
```

## 测试命令

```bash
# 手动测试爬虫
cd /Users/robin/.openclaw/workspace/projects/chileme-code
node scripts/crawler-products.js

# 测试 CPS 链接生成
node scripts/cps-generator.js

# 测试定时任务脚本
./scripts/crawler-daily.sh
```

## 监控和日志

日志文件位置：
- 爬虫日志：`logs/crawler-YYYY-MM-DD.log`
- CPS 日志：`logs/cps-YYYY-MM-DD.log`
- 每日任务日志：`logs/crawler-daily-YYYY-MM-DD.log`

查看最新日志：
```bash
tail -f logs/crawler-$(date +%Y-%m-%d).log
```

## 告警配置（可选）

如果爬虫失败，发送 Telegram 通知：

```bash
# 在 crawler-daily.sh 中添加
if [ $? -ne 0 ]; then
  curl -s "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
    -d "chat_id=$CHAT_ID" \
    -d "text=❌ 吃了么商品数据爬虫失败，请检查日志"
fi
```
