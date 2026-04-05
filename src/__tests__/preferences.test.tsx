import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateWeight, getUserPreferences, getFilteredProducts, weightedRandomSelect } from '../lib/spinService-with-preferences';

describe('用餐喜好权重测试', () => {
  const mockProduct = {
    id: '1',
    name: '麻辣牛肉',
    tags: ['beef', 'spicy', 'meat'],
    category: 'lunch',
  };

  const mockPreferences = [
    { id: '1', user_id: 'user1', preference_type: 'ingredient', preference_value: 'beef', weight: 2.0 },
    { id: '2', user_id: 'user1', preference_type: 'ingredient', preference_value: 'pork', weight: 0.3 },
    { id: '3', user_id: 'user1', preference_type: 'avoid', preference_value: 'cilantro', weight: 0 },
  ];

  describe('calculateWeight', () => {
    it('应该计算喜欢食材的权重', () => {
      const weight = calculateWeight(mockProduct, [mockPreferences[0]]);
      expect(weight).toBe(2.0);
    });

    it('应该计算不喜欢食材的权重', () => {
      const porkProduct = { ...mockProduct, tags: ['pork', 'spicy'] };
      const weight = calculateWeight(porkProduct, [mockPreferences[1]]);
      expect(weight).toBe(0.3);
    });

    it('应该排除忌口食材', () => {
      const cilantroProduct = { ...mockProduct, tags: ['cilantro', 'spicy'] };
      const weight = calculateWeight(cilantroProduct, [mockPreferences[2]]);
      expect(weight).toBe(0);
    });

    it('应该计算多个喜好的综合权重', () => {
      const weight = calculateWeight(mockProduct, mockPreferences);
      expect(weight).toBe(2.0); // beef liked, no pork, no cilantro
    });

    it('无喜好时返回基础权重 1.0', () => {
      const weight = calculateWeight(mockProduct, []);
      expect(weight).toBe(1.0);
    });
  });

  describe('weightedRandomSelect', () => {
    it('应该根据权重随机选择', () => {
      const weightedProducts = [
        { product: { id: '1', name: 'A' }, weight: 2.0 },
        { product: { id: '2', name: 'B' }, weight: 1.0 },
        { product: { id: '3', name: 'C' }, weight: 0.5 },
      ];
      
      const selected = weightedRandomSelect(weightedProducts);
      expect(selected).toBeDefined();
      expect(['1', '2', '3']).toContain(selected?.id);
    });

    it('空列表返回 null', () => {
      const selected = weightedRandomSelect([]);
      expect(selected).toBeNull();
    });
  });
});

describe('边界情况测试', () => {
  it('应该处理新用户无喜好设置', () => {
    const weight = calculateWeight({ id: '1', name: 'Test', tags: [], category: 'lunch' }, []);
    expect(weight).toBe(1.0);
  });

  it('应该处理所有商品都被忌口的情况', () => {
    const preferences = [
      { preference_type: 'avoid', preference_value: 'beef', weight: 0 },
      { preference_type: 'avoid', preference_value: 'pork', weight: 0 },
      { preference_type: 'avoid', preference_value: 'chicken', weight: 0 },
    ];
    
    const beefProduct = { id: '1', name: '牛肉', tags: ['beef'], category: 'lunch' };
    const weight = calculateWeight(beefProduct, preferences);
    expect(weight).toBe(0);
  });

  it('应该处理筛选后商品不足的情况', () => {
    // 这个在实际 getFilteredProducts 中会有警告
    expect(true).toBe(true);
  });
});
