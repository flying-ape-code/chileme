import React, { useState, useEffect, useMemo } from 'react';
import { mealTypes, getRandomItems } from './data';
import Wheel from './components/Wheel';
import CelebrationModal from './components/CelebrationModal';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden font-sans bg-cyber-dark text-white">
      <header className="mb-8 text-center animate-in slide-in-from-top duration-700">
        <h1 className="text-6xl font-black mb-2 tracking-tighter glitch-text neon-text-cyan" data-text="吃了么 ?">
          吃了么 <span className="text-cyber-pink">?</span>
        </h1>
        <p className="text-cyber-cyan font-mono text-sm tracking-widest uppercase">
          [ 命运算法启动中... ]
        </p>
      </header>

      <nav className="flex flex-wrap justify-center gap-2 mb-12">
        {mealTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => !isSpinning && setSelectedMealId(type.id)}
            disabled={isSpinning}
            className={`px-4 py-2 font-mono text-xs border-2 transition-all duration-300 ${
              selectedMealId === type.id
                ? 'bg-cyber-cyan text-cyber-dark border-cyber-cyan shadow-[0_0_15px_#00f7ff]'
                : 'border-cyber-cyan/30 text-cyber-cyan hover:border-cyber-cyan/60'
            } ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {type.name}
          </button>
        ))}
      </nav>

      <main className="relative flex flex-col items-center">
        <div className="absolute -top-6 z-40 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-cyber-pink drop-shadow-[0_0_10px_#ff00ea]">
        </div>

        <div className="p-2 rounded-full border-4 border-cyber-cyan/20 shadow-[0_0_50px_rgba(0,247,255,0.1)]">
          <Wheel 
            items={currentItems} 
            rotation={rotation} 
            isSpinning={isSpinning} 
          />
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`mt-12 cyber-button ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSpinning ? '计算中...' : '启动命运'}
        </button>
      </main>

      <footer className="mt-16 text-cyber-cyan/40 font-mono text-[10px] tracking-widest uppercase">
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
