import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { productTypes, getRandomItems, loadFoodData } from './data';
import Wheel from './components/Wheel';
import CelebrationModal from './components/CelebrationModal';
import History from './components/History';
import AdBanner from './components/AdBanner';
import { fetchActiveAd, type Ad } from './services/adService';
import ShareModal from './components/ShareModal';
import SettingsModal from './components/SettingsModal';
import { addSpinHistory } from './history';
import { getSettings, getThemeConfig, getAnimationDuration, type AppSettings } from './lib/settings';

// Lazy load heavy page components for code splitting
const Admin = lazy(() => import('./pages/Admin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProfilePage = lazy(() => import('./components/V3/ProfilePage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MyFeedbacks = lazy(() => import('./pages/MyFeedbacks'));
const FeedbackAdmin = lazy(() => import('./pages/FeedbackAdmin'));
const FeedbackStats = lazy(() => import('./pages/FeedbackStats'));
const PreferencesPage = lazy(() => import('./pages/PreferencesPage'));

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
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [selectedMealId, setSelectedMealId] = useState<string>(productTypes[0].id);
  const [currentItems, setCurrentItems] = useState<FoodItem[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<FoodItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [activeAd, setActiveAd] = useState<Ad | null>(null);

  const selectedMeal = useMemo(() =>
    productTypes.find(m => m.id === selectedMealId) || productTypes[0],
    [selectedMealId]
  );

  const theme = getThemeConfig(settings.themeColor);
  const spinDuration = getAnimationDuration(settings.animationSpeed);

  // 加载商品数据
  useEffect(() => {
    loadCurrentItems();
  }, [selectedMealId]);

  // 加载广告
  useEffect(() => {
    loadActiveAd();
  }, []);

  const loadActiveAd = async () => {
    try {
      const ad = await fetchActiveAd();
      setActiveAd(ad);
    } catch (error) {
      console.error('加载广告失败:', error);
    }
  };

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

  const saveSpinHistory = (category: typeof productTypes[0], winner: FoodItem): void => {
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
      {/* Header */}
      <header className="relative w-full px-4">
        <div className="flex items-center justify-between">
          <div className="w-10"></div>
          <div className="text-center flex-1 animate-in slide-in-from-top duration-700">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-2 tracking-tighter glitch-text neon-text-cyan" data-text="吃了么 ?">
              吃了么 <span className={`text-${theme.primary} neon-text-${theme.primary}`}>?</span>
            </h1>
            <p className="text-cyber-cyan/80 font-mono text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase">
              [ 潜运算法启动中... ]
            </p>
          </div>
          <div className="relative z-50">
            {isAuthenticated ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-cyber-cyan/20 border-2 border-cyber-cyan flex items-center justify-center hover:bg-cyber-cyan/30 transition-all"
              >
                <span className="text-lg">👤</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-10 h-10 rounded-full bg-gray-700/50 border-2 border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-all"
              >
                <span className="text-lg">🔐</span>
              </button>
            )}
            {showUserMenu && isAuthenticated && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-cyber-dark/95 border border-cyber-cyan/30 rounded-lg shadow-[0_0_20px_rgba(0,247,255,0.3)] z-[50] backdrop-blur-sm touch-manipulation">
                  <div className="p-3 border-b border-cyber-cyan/20"><p className="text-sm font-mono text-cyber-cyan">👤 {user?.username || '用户'}</p></div>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/profile'); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-cyber-cyan/10 transition-all flex items-center gap-2"><span>👤</span> 个人中心</button>
                  <button onClick={(e) => { e.stopPropagation(); setShowHistory(true); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-cyber-cyan/10 transition-all flex items-center gap-2"><span>📋</span> 历史记录</button>
                  <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-cyber-cyan/10 transition-all flex items-center gap-2"><span>⚙️</span> 设置</button>
                  {isAdmin && (<button onClick={(e) => { e.stopPropagation(); navigate('/admin'); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-green-900/20 transition-all flex items-center gap-2 border-t border-cyber-cyan/20"><span>🔐</span> 管理后台</button>)}
                  <button onClick={(e) => { e.stopPropagation(); navigate('/feedbacks'); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-cyber-cyan/10 transition-all flex items-center gap-2 border-t border-cyber-cyan/20"><span>💬</span> 我的反馈</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>


      {/* 广告栏 */}
      {activeAd && (
        <AdBanner
          imageUrl={activeAd.image_url}
          linkUrl={activeAd.link_url}
          altText={activeAd.alt_text || activeAd.title}
        />
      )}

      {/* 餐别选择 - 移动端优化 */}
      <nav className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2 relative z-20">
        {productTypes.map((meal) => (
          <button
            key={meal.id}
            onClick={() => !isSpinning && setSelectedMealId(meal.id)}
            disabled={isSpinning}
            className={`px-3 py-1 sm:px-6 sm:py-1.5 font-mono text-xs border transition-all duration-300 uppercase tracking-wider ${theme.bg} text-${theme.primary} hover:${theme.hover} hover:shadow-[0_0_15px_rgba(0,247,255,0.5)]`}
          >
            {meal.name}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="relative flex flex-col items-center flex-1 justify-center py-2 max-h-[70vh]">
        {/* Decorative Element */}
        <div className={`absolute top-[2%] z-50 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-${theme.primary} drop-shadow-[0_0_8px_rgba(0,247,255,0.8)] filter`}></div>

        {/* Wheel Container */}
        <div className="p-1 rounded-full border border-cyber-cyan/10 shadow-[0_0_30px_rgba(0,247,255,0.1)] bg-black/40 backdrop-blur-sm transform scale-90 sm:scale-100 origin-center">
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

      {/* Footer */}
      <footer className="text-cyber-cyan/30 font-mono text-[8px] tracking-[0.2em] uppercase">
        Ver 2.6.0 // Neural Link Established
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
        <Route
          path="/admin"
          element={
            <AdminDashboard />
          }
        />
        <Route path="/feedbacks/admin" element={<FeedbackAdmin />} />
        <Route path="/feedbacks/stats" element={<FeedbackStats />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/preferences" element={<PreferencesPage />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
