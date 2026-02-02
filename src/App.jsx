import React, { useState, useEffect, useMemo } from 'react';
import { mealTypes, getRandomItems } from '../data';
import Wheel from './components/Wheel';
import CelebrationModal from './components/CelebrationModal';
import WeatherInsight from './components/WeatherInsight';
import History from './components/History'; // 新增：历史记录组件

function App() {
  const [selectedMealId, setSelectedMealId] = useState(mealTypes[0].id);
  const [currentItems, setCurrentItems] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // 新增：历史记录显示状态

  const selectedMeal = useMemo(() => 
    mealTypes.find(m => m.id === selectedMealId), 
    [selectedMealId]
  );

  useEffect(() => {
    setCurrentItems(getRandomItems(selectedMealId));
  }, [selectedMealId]);

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setShowModal(false);
    setShowHistory(false); // 关闭历史记录

    const winnerIndex = Math.floor(Math.random() * currentItems.length);
    const spins = 5; 
    const segmentAngle = 360 / currentItems.length;
    const centerOffset = segmentAngle / 2;
    const topArrowPosition = 270;
    const targetOffset = topArrowPosition - (winnerIndex * segmentAngle + centerOffset);
    const newRotation = rotation + (360 * spins) + targetOffset - (rotation % 360);
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(currentItems[winnerIndex]);
      setShowModal(true);
      // 保存抽奖历史
      saveSpinHistory(selectedMeal, winner);
    }, 4000);
  };

  // 新增：保存抽奖历史的函数
  const saveSpinHistory = (category, winner) => {
    try {
      const history = JSON.parse(localStorage.getItem('spinHistory') || '[]');
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        category: category.name,
        categoryEmoji: category.emoji,
        winner: winner.name,
        winnerEmoji: winner.emoji,
        items: winner.name,
        spinCount: 1
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 49);
      localStorage.setItem('spinHistory', JSON.stringify(updatedHistory));
      
      console.log('历史记录已保存');
    } catch (error) {
      console.error('保存历史记录失败：', error);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-between py-4 overflow-hidden font-sans bg-cyber-dark text-white relative z-10">
      {/* Header */}
      <header className="text-center animate-in slide-in-from-top duration-700">
        <h1 className="text-6xl md:text-7xl font-black mb-2 tracking-tighter glitch-text neon-text-cyan" data-text="吃了么 ?">
          吃了么 <span className="text-cyber-pink neon-text-pink">?</span>
        </h1>
        <p className="text-cyber-cyan/80 font-mono text-xs tracking-[0.4em] uppercase">
          [ 潜运算法启动中... ]
        </p>
        <WeatherInsight temperature={6} condition="小雨" />
      </header>

      {/* Navigation */}
      <nav className="flex flex-wrap justify-center gap-3 relative z-20">
        <button
          onClick={() => !isSpinning && setSelectedMealId(mealTypes[0].id)}
          disabled={isSpinning}
          className="px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan hover:shadow-[0_0_15px_#00f7ff]"
        >
          {mealTypes[0].name}
        </button>
        <button
          onClick={() => !isSpinning && setSelectedMealId(mealTypes[1].id)}
          disabled={isSpinning}
          className="px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan hover:shadow-[0_0_15px_#00f7ff]"
        >
          {mealTypes[1].name}
        </button>
        <button
          onClick={() => !isSpinning && setSelectedMealId(mealTypes[2].id)}
          disabled={isSpinning}
          className="px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan hover:shadow-[0_0_15px_#00f7ff]"
        >
          {mealTypes[2].name}
        </button>
        <button
          onClick={() => !isSpinning && setSelectedMealId(mealTypes[3].id)}
          disabled={isSpinning}
          className="px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan hover:shadow-[0_0_15px_#00f7ff]"
        >
          {mealTypes[3].name}
        </button>
        
        {/* 新增：历史记录按钮 */}
        <button
          onClick={() => !isSpinning && setShowHistory(true)}
          disabled={isSpinning}
          className="px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider bg-cyber-pink/20 text-cyber-pink hover:bg-cyber-pink hover:shadow-[0_0_15px_#ff00ea]"
        >
          📋 历史
        </button>
      </nav>

      {/* Main Content */}
      <main className="relative flex flex-col items-center flex-1 justify-center py-2 max-h-[70vh]">
        {/* Decorative Element */}
        <div className="absolute top-[2%] z-50 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-cyber-pink drop-shadow-[0_0_8px_#ff00ea] filter"></div>

        {/* Wheel Container */}
        <div className="p-1 rounded-full border border-cyber-cyan/10 shadow-[0_0_30px_rgba(0,247,255,0.1)] bg-black/40 backdrop-blur-sm transform scale-[0.75] sm:scale-90 md:scale-100 origin-center">
          <Wheel 
            items={currentItems} 
            rotation={rotation} 
            isSpinning={isSpinning} 
          />
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="mt-4 cyber-button py-2 px-6 text-sm"
        >
          {isSpinning ? '计算中...' : '启动命运'}
        </button>
      </main>

      {/* Footer */}
      <footer className="text-cyber-cyan/30 font-mono text-[8px] tracking-[0.2em] uppercase">
        Ver 2.0.78 // Neural Link Established
      </footer>

      {/* Celebration Modal */}
      {showModal && winner && (
        <CelebrationModal 
          food={winner} 
          category={selectedMeal} 
          onClose={() => setShowModal(false)} 
        />
      )}

      {/* 新增：History Modal */}
      {showHistory && (
        <History 
          isOpen={showHistory}
          onClose={() => setShowHistory(false)} 
        />
      )}
    </div>
  );
}

export default App;
