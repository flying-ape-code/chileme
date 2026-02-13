// 数据迁移工具：将 meals-data.json 迁移到 localStorage
import mealsData from '../../meals-data.json';
import { getProducts, saveProducts } from './productManager';

const MIGRATION_KEY = 'chileme_data_migrated';

/**
 * 检查是否已经迁移过数据
 */
export const hasMigrated = () => {
  return localStorage.getItem(MIGRATION_KEY) === 'true';
};

/**
 * 执行数据迁移
 * 将 meals-data.json 中的数据迁移到 localStorage
 */
export const migrateData = () => {
  // 如果已经迁移过，跳过
  if (hasMigrated()) {
    console.log('Data already migrated, skipping...');
    return { success: true, message: '数据已迁移' };
  }

  try {
    // 获取当前 localStorage 中的数据
    const existingProducts = getProducts();

    // 检查每个分类是否为空
    const categories = ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'];
    let migratedCount = 0;

    const migratedData = { ...existingProducts };

    categories.forEach((category) => {
      // 如果分类为空或商品数量少于 meals-data.json 中的数量，则迁移
      const sourceData = mealsData[category] || [];
      const existingCount = existingProducts[category]?.length || 0;

      if (existingCount === 0 || existingCount < sourceData.length) {
        console.log(`Migrating ${category}: ${sourceData.length} items`);

        migratedData[category] = sourceData.map((item, index) => ({
          id: `${category}-${Date.now()}-${index}`,
          name: item.name,
          img: item.img,
          promoUrl: item.promoUrl || '',
          createdAt: new Date().toISOString()
        }));

        migratedCount += sourceData.length;
      } else {
        console.log(`Skipping ${category}: already has ${existingCount} items`);
      }
    });

    // 保存迁移后的数据
    const result = saveProducts(migratedData);

    if (result.success) {
      // 标记迁移完成
      localStorage.setItem(MIGRATION_KEY, 'true');
      console.log('Migration completed successfully!');
      return {
        success: true,
        message: `成功迁移 ${migratedCount} 个商品`,
        count: migratedCount
      };
    } else {
      console.error('Migration failed:', result.message);
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * 强制重新迁移（用于测试或数据恢复）
 */
export const forceMigrate = () => {
  localStorage.removeItem(MIGRATION_KEY);
  return migrateData();
};

/**
 * 获取迁移状态
 */
export const getMigrationStatus = () => {
  const products = getProducts();
  const totalItems = Object.values(products).reduce((sum, arr) => sum + arr.length, 0);

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
