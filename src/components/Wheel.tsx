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
  
  // 动态计算转盘尺寸 (支持 320px - 1920px)
  const getWheelSize = () => {
    if (typeof window === 'undefined') return 320;
    const width = window.innerWidth;
    if (width < 375) return 260;      // iPhone SE (320px)
    if (width < 425) return 300;      // iPhone 12/13 (390px)
    if (width < 768) return 380;      // 小屏手机/折叠屏
    if (width < 1024) return 450;     // iPad (768px)
    return 500;                        // Desktop (1920px)
  };

  const [wheelSize, setWheelSize] = React.useState(getWheelSize());

  // 监听窗口大小变化
  React.useEffect(() => {
    const handleResize = () => {
      setWheelSize(getWheelSize());
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (!safeItems || safeItems.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>暂无商品</p>
      </div>
    );
  }

  const segmentAngle = 360 / safeItems.length;

  return (
    <div className="relative transition-all duration-300 ease-out" style={{ width: wheelSize, height: wheelSize }}>
      {/* 转盘主体 */}
      <div
        className="w-full h-full rounded-full overflow-hidden border-[3px] sm:border-4 border-cyber-cyan/30 shadow-[0_0_30px_rgba(0,247,255,0.3)]"
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
                  {/* 商品图片 - 响应式尺寸 */}
                  {item.img ? (
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/90 mb-1 mx-auto overflow-hidden shadow-lg"
                      style={{
                        backgroundImage: `url(${item.img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLDivElement;
                        target.style.backgroundImage = 'none';
                        target.style.backgroundColor = '#fff';
                        target.style.display = 'flex';
                        target.style.alignItems = 'center';
                        target.style.justifyContent = 'center';
                        target.innerHTML = '<span style="font-size: 1.25rem;">🍽️</span>';
                      }}
                    />
                  ) : (
                    <div className="text-xl sm:text-2xl md:text-3xl mb-1">{item.emoji || '🍽️'}</div>
                  )}
                  {/* 商品名称 - 响应式字体 */}
                  <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-white whitespace-nowrap drop-shadow-lg max-w-[70px] sm:max-w-[80px] md:max-w-[100px] truncate">
                    {item.name || '未知'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 中心点 - 响应式尺寸 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full shadow-[0_0_20px_rgba(0,247,255,0.8)] flex items-center justify-center z-10">
        <div className="text-white text-base sm:text-lg md:text-xl font-black">吃</div>
      </div>

      {/* 指针 - 响应式位置 */}
      <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 z-20">
        <div className="w-0 h-0 border-l-[10px] sm:border-l-[12px] border-l-transparent border-r-[10px] sm:border-r-[12px] border-t-[20px] sm:border-t-[24px] border-t-cyan-400 drop-shadow-[0_0_8px_rgba(0,247,255,0.8)] filter"></div>
      </div>

      {/* 装饰光环 */}
      <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-cyan-400/20 animate-pulse"></div>
    </div>
  );
};

export default Wheel;
