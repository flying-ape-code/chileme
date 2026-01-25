import React from 'react';

const Wheel = ({ items, rotation, isSpinning }) => {
  const segmentAngle = items.length > 0 ? 360 / items.length : 0;

  return (
    <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
         style={{ transform: `rotate(${rotation}deg)` }}>
      
      <div className="absolute inset-0 rounded-full border-4 border-cyber-cyan shadow-[0_0_15px_rgba(0,247,255,0.5)] z-20 pointer-events-none"></div>

      <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl bg-cyber-dark">
        {items.map((item, index) => {
          const rotate = index * segmentAngle;
          
          return (
            <div
              key={item.id}
              className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left overflow-hidden"
              style={{
                transform: `rotate(${rotate}deg)`,
                backgroundColor: '#050505',
                borderLeft: '1px solid rgba(0, 247, 255, 0.2)',
                borderBottom: '1px solid rgba(0, 247, 255, 0.2)'
              }}
            >
              <div 
                className="absolute w-full h-full origin-bottom-left flex flex-col items-center justify-center"
                style={{
                    transform: `rotate(-${segmentAngle}deg) translateY(-20%)`,
                }}
              >
                <div 
                  className="absolute inset-0 opacity-20 mix-blend-screen grayscale contrast-150"
                  style={{
                    backgroundImage: `url(${item.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                
                <div 
                  className="relative z-10 flex flex-col items-center translate-y-16"
                  style={{ transform: `rotate(${segmentAngle / 2}deg)` }}
                >
                  <span className={`font-mono font-black text-sm md:text-xl uppercase tracking-tighter ${
                    index % 2 === 0 ? 'text-cyber-cyan neon-text-cyan' : 'text-cyber-pink neon-text-pink'
                  }`}>
                    {item.weirdName}
                  </span>
                  <span className="text-white/30 font-mono text-[8px] md:text-[10px] mt-1 border border-white/10 px-1">
                    ID: {item.name.substring(0, 4)}...
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-cyber-dark border-4 border-cyber-cyan rounded-full shadow-[0_0_20px_#00f7ff] z-30 flex items-center justify-center">
        <div className="w-8 h-8 bg-cyber-cyan rounded-full animate-pulse shadow-[0_0_15px_#00f7ff]"></div>
      </div>
    </div>
  );
};

export default Wheel;
