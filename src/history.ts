// 历史记录数据管理

// 类型定义
export interface MealType {
  name: string;
  emoji: string;
}

export interface FoodItem {
  name: string;
  emoji: string;
  weirdName: string;
  weirdEmoji: string;
}

export interface HistoryEntry {
  id: number;
  timestamp: string;
  category: string;
  categoryEmoji: string;
  winner: string;
  winnerEmoji: string;
  items: string[];
  spinCount: number;
}

export interface HistoryStats {
  totalSpins: number;
  mostFrequent: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  moodBreakdown?: Record<string, number>;
}

// 从本地存储加载历史记录
const loadHistory = (): HistoryEntry[] => {
  try {
    const saved = localStorage.getItem('spinHistory');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('加载历史记录失败：', error);
    return [];
  }
};

// 保存历史记录到本地存储
const saveHistory = (history: HistoryEntry[]): void => {
  try {
    localStorage.setItem('spinHistory', JSON.stringify(history));
  } catch (error) {
    console.error('保存历史记录失败：', error);
  }
};

// 添加新的历史记录
export const addSpinHistory = (category: MealType, items: FoodItem[], winner: FoodItem): HistoryEntry[] => {
  const history = loadHistory();

  const newEntry: HistoryEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    category: category.name,
    categoryEmoji: category.emoji,
    winner: winner.name,
    winnerEmoji: winner.emoji,
    items: items.map(item => item.weirdName),
    spinCount: 1
  };

  // 只保留最近50条记录
  const updatedHistory = [newEntry, ...history].slice(0, 49);
  saveHistory(updatedHistory);

  return updatedHistory;
};

// 获取历史记录统计
export const getHistoryStats = (): HistoryStats => {
  const history = loadHistory();

  const stats: HistoryStats = {
    totalSpins: history.length,
    mostFrequent: {},
    categoryBreakdown: {},
    moodBreakdown: {}
  };

  history.forEach(entry => {
    // 统计最常抽中的食物
    if (stats.mostFrequent[entry.winner]) {
      stats.mostFrequent[entry.winner]++;
    } else {
      stats.mostFrequent[entry.winner] = 1;
    }

    // 统计餐类分布
    if (stats.categoryBreakdown[entry.categoryEmoji]) {
      stats.categoryBreakdown[entry.categoryEmoji]++;
    } else {
      stats.categoryBreakdown[entry.categoryEmoji] = 1;
    }
  });

  return stats;
};

// 清除历史记录
export const clearHistory = (): void => {
  localStorage.removeItem('spinHistory');
};

// 获取最近的历史记录
export const getRecentHistory = (count: number = 10): HistoryEntry[] => {
  const history = loadHistory();
  return history.slice(0, count);
};
