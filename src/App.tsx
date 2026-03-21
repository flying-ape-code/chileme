import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { mealTypes, getRandomItems, loadFoodData } from './data';
import Wheel from './components/Wheel';
import CelebrationModal from './components/CelebrationModal';
import WeatherInsight from './components/WeatherInsight';
import History from './components/History';
import ShareModal from './components/ShareModal';
import SettingsModal from './components/SettingsModal';
import MobileNav from './components/MobileNav';
import BottomTabBar from './components/BottomTabBar';
import Toast from './components/Toast';
import { addSpinHistory } from './history';
import { getSettings, getThemeConfig, getAnimationDuration, type AppSettings } from './lib/settings';

// Lazy load heavy page components for code splitting
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MyFeedbacks = lazy(() => import('./pages/MyFeedbacks'));
const FeedbackAdmin = lazy(() => import('./pages/FeedbackAdmin'));
const FeedbackStats = lazy(() => import('./pages/FeedbackStats'));
const FeedbackSubmit = lazy(() => import('./pages/FeedbackSubmit'));
const Settings = lazy(() => import('./pages/Settings'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

// 类型定义
interface FoodItem {
  id?: string;
  name: string;
  img: string;
  promoUrl?: string;
  weirdName: string;
  weirdEmoji?: string;
  description?: string;
  color?: string;
}

// 主页面组件
function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read URL params to open modals
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('settings') === 'true') {
      setShowSettings(true);
    }
    if (params.get('history') === 'true') {
      setShowHistory(true);
    }
    if (params.get('feedback') === 'true') {
      navigate('/feedbacks');
    }
  }, [location.search]);
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Toast 状态
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const selectedMeal = useMemo(() =>
    mealTypes.find(m => m.id === selectedMealId) || mealTypes[0],
    [selectedMealId]
  );

  const theme = getThemeConfig(settings.themeColor);
  const spinDuration = getAnimationDuration(settings.animationSpeed);

  // 加载商品数据
  useEffect(() => {
    loadCurrentItems();
  }, [selectedMealId]);

  const loadCurrentItems = async () => {
    setIsLoading(true);
    try {
      const items = await getRandomItems(selectedMealId, 6);
      setCurrentItems(items);
    } catch (error) {
      console.error('加载商品失败:', error);
      setCurrentItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomWinnerIndex = (itemsCount: number): number => {
    return Math.floor(Math.random() * itemsCount);
  };

  const handleSpin = () => {
    if (isSpinning || currentItems.length === 0) return;

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

  const saveSpinHistory = (category: typeof mealTypes[0], winner: FoodItem): void => {
    try {
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

  const handleCopySuccess = () => {
    showToast('链接已复制到剪贴板', 'success');
  };

  const handleShareSuccess = (platform: string) => {
    showToast(`正在跳转到${platform}`, 'info');
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-cyber-dark text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-cyan-400 font-mono">加载商品数据...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-between py-2 sm:py-4 overflow-hidden font-sans bg-cyber-dark text-white relative z-10">
      {/* Toast 提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 移动端导航栏（汉堡菜单） */}
      <MobileNav
        selectedMealId={selectedMealId}
        onMealSelect={setSelectedMealId}
        isSpinning={isSpinning}
        onHistoryClick={() => setShowHistory(true)}
        onSettingsClick={() => setShowSettings(true)}
        settings={settings}
      />

      {/* 桌面端 Header */}
      <header className="hidden md:block text-center animate-in slide-in-from-top duration-700">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-2 tracking-tighter glitch-text neon-text-cyan" data-text="吃了么 ?">
          吃了么 <span className={`text-${theme.primary} neon-text-${theme.primary}`}>?</span>
        </h1>
        <p className="text-cyber-cyan/80 font-mono text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase">
          [ 潜运算法启动中... ]
        </p>
        <WeatherInsight temperature={6} condition="小雨" />
      </header>

      {/* 桌面端 Navigation */}
      <nav className="hidden md:flex flex-wrap justify-center gap-3 relative z-20">
        {mealTypes.map((meal) => (
          <button
            key={meal.id}
            onClick={() => !isSpinning && setSelectedMealId(meal.id)}
            disabled={isSpinning}
            className={`px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider ${theme.bg} text-${theme.primary} hover:${theme.hover} hover:shadow-[0_0_15px_rgba(0,247,255,0.5)] ${
              selectedMealId === meal.id ? `ring-2 ring-${theme.primary} ring-offset-2 ring-offset-cyber-dark` : ''
            }`}
          >
            {meal.name}
          </button>
        ))}

        {/* 反馈按钮 */}
        <button
          onClick={() => !isSpinning && navigate('/feedbacks/submit')}
          disabled={isSpinning}
          className="px-6 py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:shadow-[0_0_15px_#a855f7]"
        >
          💬 反馈
        </button>

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
          disabled={isSpinning || currentItems.length === 0}
          className={`mt-4 cyber-button py-2 px-6 text-sm bg-gradient-to-r ${theme.gradient} shadow-lg ${theme.shadow}`}
        >
          {isSpinning ? '计算中...' : currentItems.length === 0 ? '暂无商品' : '启动命运'}
        </button>
      </main>

      {/* Footer (桌面端显示) */}
      <footer className="hidden md:block text-cyber-cyan/30 font-mono text-[8px] tracking-[0.2em] uppercase">
        Ver 2.6.0 // Neural Link Established
      </footer>

      {/* 移动端底部导航栏 */}
      <BottomTabBar
        isSpinning={isSpinning}
        onHistoryClick={() => setShowHistory(true)}
        onSettingsClick={() => setShowSettings(true)}
        settings={settings}
      />

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
          onClose={() => setShowShare(false)}
          onCopySuccess={handleCopySuccess}
          onShareSuccess={handleShareSuccess}
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
          <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-cyan-400 font-mono text-lg">加载用户信息...</div>
          <div className="text-cyber-cyan/60 font-mono text-xs mt-2">[ Neural Link Initializing ]</div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-cyber-dark text-white">
        <div className="text-cyan-400 font-mono">加载中...</div>
      </div>
    }>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feedbacks" element={<MyFeedbacks />} />
        <Route path="/feedbacks/submit" element={<FeedbackSubmit />} />
        <Route
          path="/admin"
          element={
            <Admin />
          }
        />
        <Route path="/feedbacks/admin" element={<FeedbackAdmin />} />
        <Route path="/feedbacks/stats" element={<FeedbackStats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Home />} />
        <Route path="/history" element={<Home />} />
        <Route path="/feedbacks/submit" element={<MyFeedbacks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
