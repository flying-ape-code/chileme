import React from 'react';

const Wheel = ({ items, rotation, isSpinning }) => {
  const segmentAngle = items.length > 0 ? 360 / items.length : 0;

  return (
    <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
         style={{ transform: `rotate(${rotation}deg)` }}>
      
      <div className="absolute inset-0 rounded-full border-[3px] border-cyber-cyan shadow-[0_0_30px_rgba(0,247,255,0.4)] z-20 pointer-events-none"></div>

      <div className="absolute inset-0 rounded-full overflow-hidden bg-black shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
        {items.map((item, index) => {
          const rotate = index * segmentAngle;
          return (
            <div
              key={`bg-${item.id}`}
              className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left"
              style={{
                transform: `rotate(${rotate}deg)`,
                backgroundColor: index % 2 === 0 ? '#0a0a0a' : '#050505',
                borderLeft: '1px solid rgba(0, 247, 255, 0.1)',
                clipPath: segmentAngle <= 45 
                  ? `polygon(0% 100%, 0% 0%, ${Math.tan((segmentAngle * Math.PI) / 180) * 100}% 0%)`
                  : `polygon(0% 100%, 0% 0%, 100% 0%, 100% ${100 - (1 / Math.tan((segmentAngle * Math.PI) / 180)) * 100}%)`,
              }}
            />
          );
        })}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {items.map((item, index) => {
          const rotate = index * segmentAngle + (segmentAngle / 2);
          return (
            <div
              key={`content-${item.id}`}
              className="absolute inset-0 flex flex-col items-center"
              style={{
                transform: `rotate(${rotate}deg)`,
              }}
            >
              <div className="mt-4 md:mt-8 flex flex-col items-center pointer-events-auto">
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] z-10">
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform hover:scale-110 duration-500"
                    style={{ backgroundImage: `url(${item.img})` }}
                  />
                </div>
                
                <div className="mt-2 md:mt-4 flex flex-col items-center w-[140px] md:w-[200px]">
                  <span className={`font-mono font-black text-[10px] md:text-base uppercase tracking-tighter text-center leading-tight mb-1 ${
                    index % 2 === 0 ? 'text-cyber-cyan neon-text-cyan' : 'text-cyber-pink neon-text-pink'
                  }`}>
                    {item.weirdName}
                  </span>
                  <div className="px-3 py-1 bg-black/70 border border-cyber-cyan/20 rounded-sm backdrop-blur-md">
                    <span className="text-white/90 font-bold font-mono text-[9px] md:text-sm whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-20 md:h-20 bg-[#050505] border-[3px] border-cyber-cyan rounded-full shadow-[0_0_30px_#00f7ff] z-30 flex items-center justify-center">
        <div className="w-6 h-6 md:w-10 md:h-10 bg-cyber-cyan rounded-full animate-pulse shadow-[0_0_20px_#00f7ff]"></div>
      </div>
    </div>
  );
};

export default Wheel;
