import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { mealTypes, getRandomItems } from './data';
import Wheel from './components/Wheel';
import CelebrationModal from './components/CelebrationModal';
import WeatherInsight from './components/WeatherInsight';
import History from './components/History';
import ShareModal from './components/ShareModal';
import { addSpinHistory } from './history';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { isAuthenticated } from './utils/auth';

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

// 主页面组件
function Home() {
  const navigate = useNavigate();
  const [selectedMealId, setSelectedMealId] = useState<string>(mealTypes[0].id);
  const [currentItems, setCurrentItems] = useState<FoodItem[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<FoodItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);

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
    setShowShare(false);

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
      console.log('开始保存历史记录...');
      console.log('类别:', category);
      console.log('获胜者:', winner);
      console.log('商品列表:', currentItems);

      // 验证数据
      if (!category || !winner) {
        console.error('保存失败：类别或获胜者为空');
        return;
      }

      if (!Array.isArray(currentItems) || currentItems.length === 0) {
        console.error('保存失败：商品列表无效');
        return;
      }

      // 使用 history.ts 中的 addSpinHistory 函数
      const result = addSpinHistory(category, currentItems, winner);
      console.log('历史记录已保存，当前记录数:', result.length);

      // 验证保存是否成功
      const saved = localStorage.getItem('spinHistory');
      if (saved) {
        const history = JSON.parse(saved);
        console.log('验证：localStorage 中的记录数:', history.length);
      } else {
        console.error('验证失败：localStorage 中没有找到记录');
      }
    } catch (error) {
      console.error('保存历史记录失败：', error);
    }
  };

  const handleShare = () => {
    setShowModal(false);
    setShowShare(true);
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

        {/* 管理入口按钮 */}
        <button
          onClick={() => navigate('/admin')}
          disabled={isSpinning}
          className="px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider bg-gray-700/20 text-gray-500 hover:bg-gray-700 hover:text-white hover:shadow-[0_0_15px_#6b7280]"
        >
          ⚙️ 管理
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
          onShare={handleShare}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <History
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Share Modal */}
      {showShare && winner && (
        <ShareModal
          isOpen={showShare}
          food={winner}
          category={selectedMeal}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

// App 组件，负责路由配置
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          isAuthenticated() ? <Admin /> : <Navigate to="/login" replace />
        }
      />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
