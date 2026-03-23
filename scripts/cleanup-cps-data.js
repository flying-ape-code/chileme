/**
 * 清理 meals-data.json 中的旧字段
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filePath = path.join(__dirname, '..', 'meals-data.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// 清理每个商品的旧字段
for (const category of Object.keys(data)) {
  data[category] = data[category].map(product => {
    const { cpsError, ...rest } = product;
    return rest;
  });
}

// 保存清理后的数据
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
console.log('✅ 已清理 meals-data.json 中的旧字段');
