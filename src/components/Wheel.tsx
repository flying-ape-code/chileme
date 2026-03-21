import React from 'react';

// 类型定义
export interface FoodItem {
  id: string | number;
  name: string;
  emoji: string;
  weirdName: string;
  weirdEmoji: string;
  img?: string;
  description?: string;
}

interface WheelProps {
  items: FoodItem[];
  rotation: number;
  isSpinning?: boolean;
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

const Wheel = ({ items, rotation, isSpinning = false }: WheelProps) => {
  // 防御性检查：确保 items 是有效数组
  const safeItems = Array.isArray(items) ? items : [];
  
  if (!safeItems || safeItems.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>暂无商品</p>
      </div>
    );
  }

  const segmentAngle = 360 / safeItems.length;

  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96">
      {/* 转盘主体 */}
      <div
        className="w-full h-full rounded-full overflow-hidden border-4 border-cyber-cyan/30 shadow-[0_0_30px_rgba(0,247,255,0.3)]"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
        }}
      >
        <div className="relative w-full h-full">
          {safeItems.map((item, index) => {
            // 防御性检查：确保 item 有效
            if (!item) {
              return null;
            }
            
            const itemColor = index % 2 === 0 ? '#00f7ff' : '#ff00ea';
            const segmentRotation = index * segmentAngle;

            return (
              <div
                key={item.id ?? index}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${segmentRotation}deg)`,
                  background: `conic-gradient(from ${segmentRotation}deg ${itemColor} 0deg ${itemColor} ${segmentAngle}deg transparent ${segmentAngle}deg)`
                }}
              >
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 text-center"
                  style={{ transform: `translateX(-50%) rotate(${-segmentRotation}deg)` }}
                >
                  <div className="text-2xl sm:text-3xl mb-1">{item.emoji || '🍽️'}</div>
                  <div className="text-[10px] sm:text-xs font-bold text-white whitespace-nowrap drop-shadow-lg">
                    {item.weirdName || item.name || '未知'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 中心点 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full shadow-[0_0_20px_rgba(0,247,255,0.8)] flex items-center justify-center z-10">
        <div className="text-white text-lg sm:text-xl font-black">吃</div>
      </div>

      {/* 指针 */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-cyan-400 drop-shadow-[0_0_8px_rgba(0,247,255,0.8)] filter"></div>
      </div>

      {/* 装饰光环 */}
      <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-cyan-400/20 animate-pulse"></div>
    </div>
  );
};

export default Wheel;
