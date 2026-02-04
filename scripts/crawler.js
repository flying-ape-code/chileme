#!/usr/bin/env node

/**
 * 吃了么商品数据管理器
 * 用途：每小时验证数据完整性并备份，支持手动更新商品数据
 * 模式：自动验证 + 手动更新
 */

import fs from 'fs/promises';
import path from 'path';

// 配置
const CONFIG = {
  // 数据文件路径
  dataFilePath: path.join(process.cwd(), 'meals-data.json'),
  // 备份路径
  backupPath: path.join(process.cwd(), 'meals-data.json.backup'),
  // 日志目录
  logDir: path.join(process.cwd(), 'logs'),
  // 备份保留数量
  maxBackups: 24, // 保留24小时内的备份
};

/**
 * 验证数据完整性
 */
function validateData(data) {
  const errors = [];
  const warnings = [];
  const stats = {};

  for (const [category, items] of Object.entries(data)) {
    if (!Array.isArray(items)) {
      errors.push(`${category}: 不是数组`);
      continue;
    }

    stats[category] = items.length;

    items.forEach((item, index) => {
      // 验证必填字段
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        errors.push(`${category}[${index + 1}]: 缺少名称`);
      }

      if (!item.img || typeof item.img !== 'string' || item.img.trim() === '') {
        errors.push(`${category}[${index + 1}]: 缺少图片 URL`);
      } else if (!item.img.match(/^https?:\/\//)) {
        warnings.push(`${category}[${index + 1}]: 图片 URL 格式可能无效`);
      }

      if (!item.promoUrl || typeof item.promoUrl !== 'string' || item.promoUrl.trim() === '') {
        warnings.push(`${category}[${index + 1}]: 缺少推广链接`);
      }
    });
  }

  return { errors, warnings, stats };
}

/**
 * 创建带时间戳的备份
 */
async function backupData() {
  try {
    const data = await fs.readFile(CONFIG.dataFilePath, 'utf8');
    const timestamp = Date.now();
    const backupFilePath = path.join(
      path.dirname(CONFIG.dataFilePath),
      `meals-data-backup-${timestamp}.json`
    );

    await fs.writeFile(backupFilePath, data);
    await fs.writeFile(CONFIG.backupPath, data);

    console.log(`✅ 数据备份成功: ${path.basename(backupFilePath)}`);

    // 清理旧备份
    await cleanupOldBackups();

    return true;
  } catch (error) {
    console.error('❌ 数据备份失败:', error.message);
    return false;
  }
}

/**
 * 清理旧备份文件
 */
async function cleanupOldBackups() {
  try {
    const dir = path.dirname(CONFIG.dataFilePath);
    const files = await fs.readdir(dir);
    const backupFiles = files
      .filter(f => f.startsWith('meals-data-backup-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(dir, f),
        time: parseInt(f.match(/meals-data-backup-(\d+)/)?.[1] || '0')
      }))
      .sort((a, b) => b.time - a.time);

    // 保留最新的 N 个备份
    const toDelete = backupFiles.slice(CONFIG.maxBackups);

    for (const file of toDelete) {
      await fs.unlink(file.path);
      console.log(`🗑️  清理旧备份: ${file.name}`);
    }

    return true;
  } catch (error) {
    console.error('⚠️  清理旧备份失败:', error.message);
    return false;
  }
}

/**
 * 加载当前数据
 */
async function loadCurrentData() {
  try {
    const data = await fs.readFile(CONFIG.dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 加载数据失败:', error.message);
    return null;
  }
}

/**
 * 保存数据
 */
async function saveData(data) {
  try {
    await fs.writeFile(
      CONFIG.dataFilePath,
      JSON.stringify(data, null, 2),
      'utf8'
    );
    console.log('✅ 数据保存成功');
    return true;
  } catch (error) {
    console.error('❌ 数据保存失败:', error.message);
    return false;
  }
}

/**
 * 验证和记录数据状态
 * 注意：这是混合模式，自动验证数据，手动更新内容
 */
async function validateAndRecordData(currentData) {
  console.log('🔍 开始验证数据完整性...');

  try {
    // 验证数据
    const { errors, warnings, stats } = validateData(currentData);

    // 显示统计信息
    console.log('📊 数据统计:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const [category, count] of Object.entries(stats)) {
      const categoryNames = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'afternoon-tea': '下午茶',
        'dinner': '晚餐',
        'night-snack': '夜宵'
      };
      console.log(`  ${categoryNames[category] || category} (${category}): ${count} 个商品`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  总计: ${Object.values(stats).reduce((a, b) => a + b, 0)} 个商品`);

    // 显示警告
    if (warnings.length > 0) {
      console.log('⚠️  警告:');
      warnings.forEach(warning => console.log(`   ${warning}`));
    }

    // 显示错误
    if (errors.length > 0) {
      console.log('❌ 错误:');
      errors.forEach(error => console.log(`   ${error}`));
      return false;
    }

    console.log('✅ 数据验证通过');
    return true;

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    return false;
  }
}

/**
 * 写入日志
 */
async function writeLog(message) {
  try {
    await fs.mkdir(CONFIG.logDir, { recursive: true });

    const logFile = path.join(CONFIG.logDir, `crawler-${new Date().toISOString().split('T')[0]}.log`);
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    await fs.appendFile(logFile, logEntry, 'utf8');
  } catch (error) {
    console.error('⚠️  写入日志失败:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('吃了么 - 商品数据管理器（自动验证 + 手动更新模式）');
  console.log('========================================');

  const startTime = Date.now();

  // 加载当前数据
  const currentData = await loadCurrentData();
  if (!currentData) {
    console.error('❌ 无法加载当前数据，退出');
    await writeLog('ERROR: 无法加载当前数据');
    process.exit(1);
  }

  console.log('📊 当前数据类别:', Object.keys(currentData).join(', '));

  // 验证数据
  const isValid = await validateAndRecordData(currentData);

  if (!isValid) {
    console.log('❌ 数据验证失败');
    await writeLog('ERROR: 数据验证失败');
    process.exit(1);
  }

  // 备份数据
  const backupSuccess = await backupData();

  if (!backupSuccess) {
    console.log('❌ 数据备份失败');
    await writeLog('ERROR: 数据备份失败');
    process.exit(1);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('========================================');
  console.log(`✅ 执行完成 (耗时: ${duration}秒)`);
  console.log(`📝 日志: ${CONFIG.logDir}`);
  console.log('💡 提示: 使用 `node scripts/manage-meals.cjs` 来更新商品数据');

  await writeLog(`SUCCESS: 数据验证和备份完成 (耗时: ${duration}秒)`);
}

// 执行主函数
main().catch(error => {
  console.error('❌ 程序异常:', error);
  writeLog(`ERROR: 程序异常 - ${error.message}`).then(() => {
    process.exit(1);
  });
});
