import React, { useMemo } from 'react';
import { funnyPhrases } from '../data';

const CelebrationModal = ({ food, category, onClose }) => {
  if (!food) return null;

  const phrase = useMemo(() => 
    funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)], 
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-dark/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-cyber-dark border-2 border-cyber-cyan p-8 max-w-sm w-full text-center shadow-[0_0_30px_rgba(0,247,255,0.3)] scale-up-center animate-in zoom-in-95 duration-300 relative">
        <div className="absolute top-2 left-2 text-cyber-cyan font-mono text-[8px] opacity-50 uppercase tracking-tighter">
          Analysis Complete // Target Identified
        </div>
        
        <div className="text-4xl mb-4 neon-text-pink">⚡</div>
        <h2 className="text-3xl font-black text-cyber-cyan mb-2 neon-text-cyan glitch-text" data-text="中奖啦！">
          中奖啦！
        </h2>
        <p className="text-cyber-cyan/70 font-mono text-xs mb-6 uppercase tracking-widest">
          {category.name}决选结果：
        </p>
        
        <div className="relative border-2 border-cyber-pink overflow-hidden mb-6 aspect-square shadow-[0_0_20px_rgba(255,0,234,0.3)]">
          <img 
            src={food.img} 
            alt={food.name} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute bottom-0 inset-x-0 bg-cyber-dark/80 border-t border-cyber-pink p-4">
            <span className="text-cyber-pink text-xl font-black tracking-widest">{food.name}</span>
          </div>
        </div>

        <p className="text-white font-mono text-sm mb-8 leading-relaxed italic border-l-2 border-cyber-yellow pl-4 text-left">
          "{phrase}"
        </p>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-transparent border-2 border-cyber-cyan text-cyber-cyan font-black tracking-[0.2em] uppercase hover:bg-cyber-cyan hover:text-cyber-dark transition-all duration-300 shadow-[0_0_10px_rgba(0,247,255,0.5)] active:scale-95"
          style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)' }}
        >
          确认注入营养
        </button>
      </div>
    </div>
  );
};

export default CelebrationModal;
