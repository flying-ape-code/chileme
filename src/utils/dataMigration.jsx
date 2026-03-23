// 数据迁移工具：从数据库读取数据（已废弃，仅保留用于历史参考）
// 注意：此文件已不再使用，所有数据现在直接从 Supabase products 表读取
import { getProducts } from './productManager';

const MIGRATION_KEY = 'chileme_data_migrated';

/**
 * 检查是否已经迁移过数据
 */
export const hasMigrated = () => {
  return localStorage.getItem(MIGRATION_KEY) === 'true';
};

/**
 * 执行数据迁移（已废弃）
 * 注意：现在所有数据直接从数据库读取，不再需要迁移
 */
export const migrateData = () => {
  console.warn('migrateData is deprecated - data is now loaded directly from database');
  return { 
    success: true, 
    message: '数据已从数据库直接加载，无需迁移',
    deprecated: true
  };
};

/**
 * 强制重新迁移（已废弃）
 */
export const forceMigrate = () => {
  console.warn('forceMigrate is deprecated - data is now loaded directly from database');
  return migrateData();
};

/**
 * 获取迁移状态
 */
export const getMigrationStatus = () => {
  const products = getProducts();
  const totalItems = Object.values(products).reduce((sum, arr) => sum + arr.length, 0);

  return {
    migrated: true, // 现在总是 true，因为直接从数据库读取
    totalItems,
    usingDatabase: true,
    breakdown: {
      breakfast: products.breakfast?.length || 0,
      lunch: products.lunch?.length || 0,
      'afternoon-tea': products['afternoon-tea']?.length || 0,
      dinner: products.dinner?.length || 0,
      'night-snack': products['night-snack']?.length || 0
    }
  };
};
