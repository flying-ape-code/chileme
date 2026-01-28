import mealsData from '../meals-data.json';

export const mealTypes = [
  { id: 'breakfast', name: '早餐' },
  { id: 'lunch', name: '午餐' },
  { id: 'afternoon-tea', name: '下午茶' },
  { id: 'dinner', name: '晚餐' },
  { id: 'night-snack', name: '夜宵' }
];

// 使用 JSON 文件中的数据（包含推广链接）
export const foodData = mealsData;

export const weirdPlaceholders = [
  '电子羊排',
  '赛博包子',
  '数字压缩饼干',
  '量子豆腐',
  '高维度沙拉',
  '虚拟鸡腿',
  '404 蛋糕',
  '像素肉圆',
  '代码面条',
  '内存果汁',
  '固态硬盘烤肉',
  'GPU 煎饼',
  '溢出流心包',
  '内核熔断肉',
  '缓存预热茶',
  '递归红烧肉'
];

export const funnyPhrases = [
  '这就是命运的终极代码！',
  '系统检测到你的胃正在请求这个。',
  '赛博之神已经为你做出了最优选。',
  '拒绝无效，请立即前往进食。',
  '恭喜你，避开了所有黑暗料理。',
  '数据分析显示，你的卡路里缺口正适合这个。',
  '这不仅仅是一顿饭，这是一次灵魂的下载。',
  '检测到高能营养反应，目标已锁定。',
  '协议已达成：你的胃将归属于它。'
];

export const getRandomItems = (category, count = 6) => {
  const allItems = [...foodData[category]];
  for (let i = allItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
  }

  return allItems.slice(0, count).map((item, index) => ({
    id: `${category}-${index}`,
    ...item,
    weirdName: weirdPlaceholders[Math.floor(Math.random() * weirdPlaceholders.length)],
    color: index % 2 === 0 ? '#00f7ff' : '#ff00ea'
  }));
};
