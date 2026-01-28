#!/usr/bin/env node

/**
 * 吃了么 - 数据管理工具
 * 用于管理 meals-data.json 中的餐饮商品数据
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 数据文件路径
const DATA_FILE = path.join(__dirname, '..', 'meals-data.json');
const BACKUP_FILE = path.join(__dirname, '..', `meals-data-backup-${Date.now()}.json`);

// 餐食类别
const CATEGORIES = ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'];
const CATEGORY_NAMES = {
  'breakfast': '早餐',
  'lunch': '午餐',
  'afternoon-tea': '下午茶',
  'dinner': '晚餐',
  'night-snack': '夜宵'
};

/**
 * 读取数据文件
 */
function loadData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 读取数据文件失败:', error.message);
    process.exit(1);
  }
}

/**
 * 保存数据文件（先备份）
 */
function saveData(data) {
  // 创建备份
  try {
    const originalData = fs.readFileSync(DATA_FILE, 'utf-8');
    fs.writeFileSync(BACKUP_FILE, originalData);
    console.log(`✅ 已创建备份: ${BACKUP_FILE}`);
  } catch (error) {
    console.warn('⚠️  警告: 创建备份失败:', error.message);
  }

  // 保存新数据
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ 数据保存成功!');
  } catch (error) {
    console.error('❌ 保存数据失败:', error.message);
    process.exit(1);
  }
}

/**
 * 显示统计信息
 */
function showStats(data) {
  console.log('\n📊 数据统计:');
  console.log('━'.repeat(50));

  let total = 0;
  CATEGORIES.forEach(cat => {
    const count = data[cat]?.length || 0;
    total += count;
    console.log(`  ${CATEGORY_NAMES[cat]} (${cat}): ${count} 个商品`);
  });

  console.log('━'.repeat(50));
  console.log(`  总计: ${total} 个商品\n`);
}

/**
 * 列出指定类别的商品
 */
function listCategory(data, category) {
  const items = data[category] || [];

  console.log(`\n📋 ${CATEGORY_NAMES[category]} (${category}):`);
  console.log('━'.repeat(50));

  if (items.length === 0) {
    console.log('  (空)');
  } else {
    items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name}`);
      console.log(`     图片: ${item.img.substring(0, 50)}...`);
      console.log(`     链接: ${item.promoUrl.substring(0, 50)}...`);
      console.log();
    });
  }

  console.log(`  共 ${items.length} 个商品\n`);
}

/**
 * 添加商品
 */
function addItem(data, category) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

  (async () => {
    try {
      console.log(`\n➕ 添加商品到 ${CATEGORY_NAMES[category]}\n`);

      const name = await question('商品名称: ');
      const img = await question('图片 URL: ');
      const promoUrl = await question('推广链接 (美团): ');

      if (!data[category]) {
        data[category] = [];
      }

      data[category].push({
        name,
        img,
        promoUrl
      });

      saveData(data);
      console.log(`\n✅ 已添加商品: ${name}\n`);

    } catch (error) {
      console.error('❌ 添加商品失败:', error.message);
    } finally {
      rl.close();
    }
  })();
}

/**
 * 删除商品
 */
function deleteItem(data, category, index) {
  if (!data[category]) {
    console.error(`❌ 类别 ${category} 不存在`);
    process.exit(1);
  }

  if (index < 1 || index > data[category].length) {
    console.error(`❌ 索引 ${index} 超出范围 (1-${data[category].length})`);
    process.exit(1);
  }

  const item = data[category][index - 1];
  data[category].splice(index - 1, 1);

  saveData(data);
  console.log(`\n✅ 已删除商品: ${item.name}\n`);
}

/**
 * 导出为 CSV
 */
function exportCSV(data, outputFile) {
  const rows = [];

  CATEGORIES.forEach(cat => {
    data[cat]?.forEach((item, index) => {
      rows.push({
        category: CATEGORY_NAMES[cat],
        categoryKey: cat,
        name: item.name,
        img: item.img,
        promoUrl: item.promoUrl
      });
    });
  });

  const header = ['category', 'categoryKey', 'name', 'img', 'promoUrl'].join(',');
  const lines = rows.map(row =>
    [row.category, row.categoryKey, `"${row.name}"`, row.img, row.promoUrl].join(',')
  );

  const csv = [header, ...lines].join('\n');

  fs.writeFileSync(outputFile, csv, 'utf-8');
  console.log(`\n✅ 已导出到: ${outputFile}`);
  console.log(`   共 ${rows.length} 条记录\n`);
}

/**
 * 从 CSV 导入
 */
function importCSV(data, inputFile) {
  const csv = fs.readFileSync(inputFile, 'utf-8');
  const lines = csv.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    console.error('❌ CSV 文件为空或格式不正确');
    process.exit(1);
  }

  const header = lines[0].split(',');
  const categoryNameMap = Object.fromEntries(
    Object.entries(CATEGORY_NAMES).map(([k, v]) => [v, k])
  );

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].split(',');
      if (values.length < 5) {
        skipped++;
        continue;
      }

      const category = categoryNameMap[values[0].trim()] || values[1].trim();
      const name = values[2].replace(/^"|"$/g, '').trim();
      const img = values[3].trim();
      const promoUrl = values[4].trim();

      if (!CATEGORIES.includes(category)) {
        console.warn(`⚠️  跳过未知类别: ${category}`);
        skipped++;
        continue;
      }

      if (!data[category]) {
        data[category] = [];
      }

      data[category].push({ name, img, promoUrl });
      imported++;
    } catch (error) {
      console.warn(`⚠️  跳过第 ${i + 1} 行: ${error.message}`);
      skipped++;
    }
  }

  saveData(data);
  console.log(`\n✅ 导入完成:`);
  console.log(`   成功导入: ${imported} 条`);
  console.log(`   跳过: ${skipped} 条\n`);
}

/**
 * 验证数据
 */
function validateData(data) {
  let errors = 0;
  let warnings = 0;

  console.log('\n🔍 数据验证:');
  console.log('━'.repeat(50));

  CATEGORIES.forEach(cat => {
    const items = data[cat] || [];

    if (items.length === 0) {
      console.warn(`  ⚠️  ${CATEGORY_NAMES[cat]}: 空类别`);
      warnings++;
      return;
    }

    items.forEach((item, index) => {
      if (!item.name || item.name.trim() === '') {
        console.error(`  ❌ ${CATEGORY_NAMES[cat]}[${index + 1}]: 缺少名称`);
        errors++;
      }

      if (!item.img || !item.img.startsWith('http')) {
        console.warn(`  ⚠️  ${CATEGORY_NAMES[cat]}[${index + 1}]: 图片 URL 无效`);
        warnings++;
      }

      if (!item.promoUrl || !item.promoUrl.startsWith('http')) {
        console.warn(`  ⚠️  ${CATEGORY_NAMES[cat]}[${index + 1}]: 推广链接无效`);
        warnings++;
      }
    });
  });

  console.log('━'.repeat(50));
  if (errors > 0) {
    console.log(`  ❌ 发现 ${errors} 个错误, ${warnings} 个警告\n`);
  } else if (warnings > 0) {
    console.log(`  ✅ 通过 (${warnings} 个警告)\n`);
  } else {
    console.log(`  ✅ 数据完全正确\n`);
  }

  return errors === 0;
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'stats';

  const data = loadData();

  switch (command) {
    case 'stats':
      showStats(data);
      break;

    case 'list':
      const listCategoryArg = args[1];
      if (listCategoryArg) {
        if (!CATEGORIES.includes(listCategoryArg)) {
          console.error(`❌ 无效的类别: ${listCategoryArg}`);
          console.log(`   可用类别: ${CATEGORIES.join(', ')}`);
          process.exit(1);
        }
        listCategory(data, listCategoryArg);
      } else {
        CATEGORIES.forEach(cat => listCategory(data, cat));
      }
      break;

    case 'add':
      const addCategoryArg = args[1];
      if (!addCategoryArg || !CATEGORIES.includes(addCategoryArg)) {
        console.error('用法: node manage-meals.js add <category>');
        console.log(`   可用类别: ${CATEGORIES.join(', ')}`);
        process.exit(1);
      }
      addItem(data, addCategoryArg);
      break;

    case 'delete':
      const deleteCategoryArg = args[1];
      const deleteIndexArg = parseInt(args[2]);
      if (!deleteCategoryArg || !CATEGORIES.includes(deleteCategoryArg) || isNaN(deleteIndexArg)) {
        console.error('用法: node manage-meals.js delete <category> <index>');
        process.exit(1);
      }
      deleteItem(data, deleteCategoryArg, deleteIndexArg);
      break;

    case 'export':
      const exportFile = args[1] || 'meals-export.csv';
      exportCSV(data, exportFile);
      break;

    case 'import':
      const importFile = args[1];
      if (!importFile) {
        console.error('用法: node manage-meals.js import <csv-file>');
        process.exit(1);
      }
      if (!fs.existsSync(importFile)) {
        console.error(`❌ 文件不存在: ${importFile}`);
        process.exit(1);
      }
      importCSV(data, importFile);
      break;

    case 'validate':
      const isValid = validateData(data);
      process.exit(isValid ? 0 : 1);

    default:
      console.log('吃了么 - 数据管理工具\n');
      console.log('用法:');
      console.log('  node manage-meals.js stats           - 显示统计信息');
      console.log('  node manage-meals.js list [category] - 列出商品 (可指定类别)');
      console.log('  node manage-meals.js add <category>  - 交互式添加商品');
      console.log('  node manage-meals.js delete <cat> <index> - 删除商品');
      console.log('  node manage-meals.js export [file]   - 导出为 CSV');
      console.log('  node manage-meals.js import <file>   - 从 CSV 导入');
      console.log('  node manage-meals.js validate        - 验证数据\n');
      console.log('类别:', CATEGORIES.join(', '));
      console.log(`\n示例:`);
      console.log('  node manage-meals.js list breakfast');
      console.log('  node manage-meals.js add lunch');
      console.log('  node manage-meals.js export my-meals.csv');
      console.log('  node manage-meals.js import my-meals.csv\n');
  }
}

main();
