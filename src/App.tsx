import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { mealTypes, getRandomItems } from './data';
import Wheel from './components/Wheel';
import CelebrationModal from './components/CelebrationModal';
import WeatherInsight from './components/WeatherInsight';
import History from './components/History';
import ShareModal from './components/ShareModal';
import SettingsModal from './components/SettingsModal';
import { addSpinHistory } from './history';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import { getSettings, getThemeConfig, getAnimationDuration, type AppSettings } from './lib/settings';

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

// 主页面组件
function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [selectedMealId, setSelectedMealId] = useState<string>(mealTypes[0].id);
  const [currentItems, setCurrentItems] = useState<FoodItem[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<FoodItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const selectedMeal = useMemo(() =>
    mealTypes.find(m => m.id === selectedMealId) || mealTypes[0],
    [selectedMealId]
  );

  const theme = getThemeConfig(settings.themeColor);
  const spinDuration = getAnimationDuration(settings.animationSpeed);

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
    }, spinDuration + 500);
  };

  const saveSpinHistory = (category: MealType, winner: FoodItem): void => {
    try {
      console.log('开始保存历史记录...');
      console.log('类别:', category);
      console.log('获胜者:', winner);
      console.log('商品列表:', currentItems);

      if (!category || !winner) {
        console.error('保存失败：类别或获胜者为空');
        return;
      }

      if (!Array.isArray(currentItems) || currentItems.length === 0) {
        console.error('保存失败：商品列表无效');
        return;
      }

      const result = addSpinHistory(category, currentItems, winner);
      console.log('历史记录已保存，当前记录数:', result.length);
    } catch (error) {
      console.error('保存历史记录失败：', error);
    }
  };

  const handleShare = () => {
    setShowModal(false);
    setShowShare(true);
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  // 动态生成主题类名
  const themeClasses = {
    primary: `text-${theme.primary}`,
    border: `border-${theme.primary}`,
    shadow: `shadow-${theme.primary}/50`,
    gradient: `bg-gradient-to-r ${theme.gradient}`,
    bg: `bg-${theme.primary}/20`,
    hover: `hover:bg-${theme.primary}`,
    neon: `neon-text-${theme.primary}`
  };

  return (
    <div className="h-screen flex flex-col items-center justify-between py-2 sm:py-4 overflow-hidden font-sans bg-cyber-dark text-white relative z-10">
      {/* Header */}
      <header className="text-center animate-in slide-in-from-top duration-700">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-2 tracking-tighter glitch-text neon-text-cyan" data-text="吃了么 ?">
          吃了么 <span className={`text-${theme.primary} neon-text-${theme.primary}`}>?</span>
        </h1>
        <p className="text-cyber-cyan/80 font-mono text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase">
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
            className={`px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider ${theme.bg} text-${theme.primary} hover:${theme.hover} hover:shadow-[0_0_15px_rgba(0,247,255,0.5)]`}
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

        {/* 设置按钮 */}
        <button
          onClick={() => !isSpinning && setShowSettings(true)}
          disabled={isSpinning}
          className={`px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider ${theme.bg} text-${theme.primary} hover:${theme.hover} hover:shadow-[0_0_15px_rgba(0,247,255,0.5)]`}
        >
          ⚙️ 设置
        </button>

        {/* 用户/登录按钮 */}
        {isAuthenticated ? (
          <>
            <span className={`px-6 py-1.5 font-mono text-xs border ${theme.bg} text-${theme.primary}`}>
              👤 {user?.username || '用户'}
            </span>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                disabled={isSpinning}
                className="px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider bg-green-700/20 text-green-400 hover:bg-green-700 hover:text-white hover:shadow-[0_0_15px_#22c55e]"
              >
                🔐 管理
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider bg-gray-700/20 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              🔐 登录
            </button>
            <button
              onClick={() => navigate('/register')}
              className={`px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider ${theme.bg} text-${theme.primary} hover:${theme.hover}`}
            >
              📝 注册
            </button>
          </>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative flex flex-col items-center flex-1 justify-center py-2 max-h-[70vh]">
        {/* Decorative Element */}
        <div className={`absolute top-[2%] z-50 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-${theme.primary} drop-shadow-[0_0_8px_rgba(0,247,255,0.8)] filter`}></div>

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
          className={`mt-4 cyber-button py-2 px-6 text-sm bg-gradient-to-r ${theme.gradient} shadow-lg ${theme.shadow}`}
        >
          {isSpinning ? '计算中...' : '启动命运'}
        </button>
      </main>

      {/* Footer */}
      <footer className="text-cyber-cyan/30 font-mono text-[8px] tracking-[0.2em] uppercase">
        Ver 2.1.0 // Supabase Auth Enabled
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}

// App 组件，负责路由配置
function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-cyber-dark text-white">
        <div className="text-center">
          <div className="text-2xl font-mono text-cyan-400 mb-2">加载用户信息...</div>
          <div className="text-cyber-cyan/60 font-mono text-xs">[ Neural Link Initializing ]</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
