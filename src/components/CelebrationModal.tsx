import React, { useMemo } from 'react';

// 类型定义
export interface FoodItem {
  id: string | number;
  name: string;
  emoji: string;
  weirdName: string;
  weirdEmoji: string;
  img?: string;
  description?: string;
  promoUrl?: string;
}

export interface MealType {
  id: string;
  name: string;
  emoji: string;
}

const funnyPhrases = [
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

interface CelebrationModalProps {
  food: FoodItem;
  category: MealType;
  onClose: () => void;
  onShare: () => void;
}

const CelebrationModal = ({ food, category, onClose, onShare }: CelebrationModalProps) => {
  const randomPhrase = useMemo(() => 
    funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)], 
    []
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 rounded-2xl max-w-md w-full p-8 border border-cyan-500/50 shadow-[0_0_50px_rgba(0,247,255,0.3)] animate-in zoom-in duration-300">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        >
          ✕
        </button>

        {/* 内容 */}
        <div className="text-center">
          {/* 表情符号 */}
          <div className="text-6xl mb-4 animate-bounce">{food.weirdEmoji || '🍽️'}</div>

          {/* 食物名称 */}
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 glitch-text" data-text={food.weirdName}>
            {food.weirdName}
          </h2>

          {/* 分类 */}
          <p className="text-cyber-cyan/80 font-mono text-sm mb-6">
            {category.emoji} {category.name}
          </p>

          {/* 随机短语 */}
          <p className="text-cyber-pink/90 font-mono text-xs mb-8 leading-relaxed">
            {randomPhrase}
          </p>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={onShare}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-bold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,247,255,0.5)]"
            >
              📤 分享
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all"
            >
              再选一次
            </button>
          </div>

          {/* 推广链接 */}
          {food.promoUrl && (
            <a
              href={food.promoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,100,100,0.5)]"
            >
              🎁 立即点餐
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CelebrationModal;
