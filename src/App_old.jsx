import React, { useState, useEffect, useMemo } from 'react';
import { mealTypes, getRandomItems } from './data';
import Wheel from './components/Wheel';
import CelebrationModal from './components/CelebrationModal';
import WeatherInsight from './components/WeatherInsight';

function App() {
  const [selectedMealId, setSelectedMealId] = useState(mealTypes[0].id);
  const [currentItems, setCurrentItems] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    }, 4000);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-between py-4 overflow-hidden font-sans bg-cyber-dark text-white relative z-10">
      <header className="text-center animate-in slide-in-from-top duration-700">
        <h1 className="text-6xl md:text-7xl font-black mb-2 tracking-tighter glitch-text neon-text-cyan" data-text="吃了么 ?">
          吃了么 <span className="text-cyber-pink neon-text-pink">?</span>
        </h1>
        <p className="text-cyber-cyan/80 font-mono text-xs tracking-[0.4em] uppercase">
          [ 命运算法启动中... ]
        </p>
        <WeatherInsight temperature={6} condition="小雨" />
      </header>

      <nav className="flex flex-wrap justify-center gap-3 relative z-20">
        {mealTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => !isSpinning && setSelectedMealId(type.id)}
            disabled={isSpinning}
            className={`px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider ${
              selectedMealId === type.id
                ? 'bg-cyber-cyan text-black border-cyber-cyan shadow-[0_0_15px_#00f7ff] font-bold scale-105'
                : 'border-cyber-cyan/30 text-cyber-cyan/70 hover:text-cyber-cyan hover:border-cyber-cyan hover:shadow-[0_0_8px_rgba(0,247,255,0.3)] bg-black/50'
            } ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {type.name}
          </button>
        ))}
      </nav>

      <main className="relative flex flex-col items-center flex-1 justify-center py-2 max-h-[70vh]">
        <div className="absolute top-[2%] z-50 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-cyber-pink drop-shadow-[0_0_8px_#ff00ea] filter">
        </div>

        <div className="p-1 rounded-full border border-cyber-cyan/10 shadow-[0_0_30px_rgba(0,247,255,0.1)] bg-black/40 backdrop-blur-sm transform scale-[0.75] sm:scale-90 md:scale-100 origin-center">
          <Wheel 
            items={currentItems} 
            rotation={rotation} 
            isSpinning={isSpinning} 
          />
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`mt-4 cyber-button py-2 px-6 text-sm ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSpinning ? '计算中...' : '启动命运'}
        </button>
      </main>

      <footer className="text-cyber-cyan/30 font-mono text-[8px] tracking-[0.2em] uppercase">
        Ver 2.0.77 // Neural Link Established
      </footer>

      {showModal && winner && (
        <CelebrationModal 
          food={winner} 
          category={selectedMeal} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}

export default App;
