import React, { useState, useEffect, useMemo } from 'react';
import { mealTypes, getRandomItems } from './data';
import Wheel from './components/Wheel';
import CelebrationModal from './components/CelebrationModal';
import WeatherInsight from './components/WeatherInsight';
import History from './components/History';

// 类型定义
interface MealType {
  id: string;
  name: string;
  emoji: string;
}

interface FoodItem {
  name: string;
  emoji: string;
  weirdName: string;
  weirdEmoji: string;
  description?: string;
}

interface HistoryEntry {
  id: number;
  timestamp: string;
  category: string;
  categoryEmoji: string;
  winner: string;
  winnerEmoji: string;
  items: string[];
  spinCount: number;
}

function App() {
  const [selectedMealId, setSelectedMealId] = useState<string>(mealTypes[0].id);
  const [currentItems, setCurrentItems] = useState<FoodItem[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<FoodItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const selectedMeal = useMemo(() =>
    mealTypes.find(m => m.id === selectedMealId) || mealTypes[0],
    [selectedMealId]
  );

  useEffect(() => {
    setCurrentItems(getRandomItems(selectedMealId));
  }, [selectedMealId]);

  const getRandomWinnerIndex = (itemsCount: number): number => {
    return Math.floor(Math.random() * itemsCount);
  };

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setShowModal(false);
    setShowHistory(false);

    const winnerIndex = getRandomWinnerIndex(currentItems.length);
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
      saveSpinHistory(selectedMeal, currentItems[winnerIndex]);
    }, 4000);
  };

  const saveSpinHistory = (category: MealType, winner: FoodItem): void => {
    try {
      const history = JSON.parse(localStorage.getItem('spinHistory') || '[]') as HistoryEntry[];
      const newEntry: HistoryEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        category: category.name,
        categoryEmoji: category.emoji,
        winner: winner.name,
        winnerEmoji: winner.emoji,
        items: [winner.name],
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
        {mealTypes.map((meal) => (
          <button
            key={meal.id}
            onClick={() => !isSpinning && setSelectedMealId(meal.id)}
            disabled={isSpinning}
            className="px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan hover:shadow-[0_0_15px_#00f7ff]"
          >
            {meal.name}
          </button>
        ))}

        {/* 历史记录按钮 */}
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

      {/* History Modal */}
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
