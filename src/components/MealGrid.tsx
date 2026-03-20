import React, { useState, useEffect } from 'react';
import { getMealsByCategory, getRandomMeals, type Meal } from '../lib/mealsService';
import MealCard from './MealCard';

interface MealGridProps {
  selectedCategory: string;
}

export default function MealGrid({ selectedCategory }: MealGridProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadMeals();
  }, [selectedCategory]);

  const loadMeals = async () => {
    setIsLoading(true);
    const categoryMeals = await getMealsByCategory(selectedCategory);
    const randomMeals = getRandomMeals(categoryMeals, 6);
    setMeals(randomMeals);
    setCount(categoryMeals.length);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="meal-grid-loading text-center py-12">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="meal-grid">
      {/* 分类信息 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {selectedCategory === 'breakfast' && '🌅 早餐'}
          {selectedCategory === 'lunch' && '🍜 午餐'}
          {selectedCategory === 'afternoon-tea' && '☕ 下午茶'}
          {selectedCategory === 'dinner' && '🍽️ 晚餐'}
          {selectedCategory === 'night-snack' && '🌙 夜宵'}
        </h2>
        <span className="text-cyber-cyan/60 text-sm">
          共 {count} 个商品
        </span>
      </div>

      {/* 商品网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.map(meal => (
          <MealCard
            key={meal.id}
            id={meal.id}
            name={meal.name}
            image_url={meal.image_url}
            cps_link={meal.cps_link || ''}
            category={meal.category}
          />
        ))}
      </div>

      {/* 空状态 */}
      {meals.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>暂无商品</p>
        </div>
      )}
    </div>
  );
}
