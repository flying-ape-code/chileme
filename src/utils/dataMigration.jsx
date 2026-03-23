// 数据迁移工具：从数据库迁移数据到 localStorage（已弃用）
// V3.0: 数据完全从 products 表读取，不再需要迁移

import { getProductsByCategory } from '../lib/productsService';

const MIGRATION_KEY = 'chileme_data_migrated';

/**
 * 检查是否已经迁移过数据
 */
export const hasMigrated = () => {
  return localStorage.getItem(MIGRATION_KEY) === 'true';
};

/**
 * 执行数据迁移
 * V3.0: 从 products 表读取数据迁移到 localStorage
 */
export const migrateData = async () => {
  // 如果已经迁移过，跳过
  if (hasMigrated()) {
    console.log('Data already migrated, skipping...');
    return { success: true, message: '数据已迁移' };
  }

  try {
    // 从数据库读取商品数据
    const categories = ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'];
    let migratedCount = 0;
    const migratedData = {};

    for (const category of categories) {
      const products = await getProductsByCategory(category);
      
      if (products.length > 0) {
        console.log(`Migrating ${category}: ${products.length} items`);
        
        migratedData[category] = products.map((product) => ({
          id: product.id,
          name: product.name,
          img: product.img,
          promoUrl: product.cpsLink || product.promoUrl || '',
          createdAt: product.createdAt || new Date().toISOString()
        }));

        migratedCount += products.length;
      }
    }

    // 保存到 localStorage
    if (migratedCount > 0) {
      localStorage.setItem('chileme_products', JSON.stringify(migratedData));
      localStorage.setItem(MIGRATION_KEY, 'true');
      console.log('Migration completed successfully!');
      return {
        success: true,
        message: `成功迁移 ${migratedCount} 个商品`,
        count: migratedCount
      };
    } else {
      return { success: true, message: '没有需要迁移的数据' };
    }
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * 强制重新迁移（用于测试或数据恢复）
 */
export const forceMigrate = async () => {
  localStorage.removeItem(MIGRATION_KEY);
  return await migrateData();
};

/**
 * 获取迁移状态
 */
export const getMigrationStatus = () => {
  const products = JSON.parse(localStorage.getItem('chileme_products') || '{}');
  const totalItems = Object.values(products).reduce((sum: any, arr: any[]) => sum + arr.length, 0);

  return {
    migrated: hasMigrated(),
    totalItems,
    breakdown: {
      breakfast: products.breakfast?.length || 0,
      lunch: products.lunch?.length || 0,
      'afternoon-tea': products['afternoon-tea']?.length || 0,
      dinner: products.dinner?.length || 0,
      'night-snack': products['night-snack']?.length || 0
    }
  };
};
