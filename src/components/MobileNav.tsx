import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mealTypes } from '../data';
import { getThemeConfig, type AppSettings } from '../lib/settings';

interface MobileNavProps {
  selectedMealId: string;
  onMealSelect: (mealId: string) => void;
  isSpinning: boolean;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  settings: AppSettings;
}

const MobileNav = ({
  selectedMealId,
  onMealSelect,
  isSpinning,
  onHistoryClick,
  onSettingsClick,
  settings
}: MobileNavProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const theme = getThemeConfig(settings.themeColor);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    if (!isSpinning) {
      navigate(path);
    }
  };

  return (
    <>
      {/* 移动端汉堡菜单按钮 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-cyber-dark/95 backdrop-blur-sm border-b border-cyan-500/20 px-4 py-3 flex items-center justify-between md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-2xl text-cyan-400 hover:text-cyan-300 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="菜单"
        >
          {isOpen ? '✕' : '☰'}
        </button>
        
        <h1 className="text-xl font-black glitch-text neon-text-cyan" data-text="吃了么">
          吃了么 <span className={`text-${theme.primary}`}>?</span>
        </h1>
        
        <div className="w-11 h-11 flex items-center justify-center">
          {isAuthenticated ? (
            <span className={`text-sm font-mono text-${theme.primary}`}>
              👤
            </span>
          ) : (
            <button
              onClick={() => handleNavigate('/login')}
              className="text-sm font-mono text-gray-400 hover:text-white transition-colors"
            >
              🔐
            </button>
          )}
        </div>
      </div>

      {/* 侧边菜单 */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 菜单内容 */}
          <div className="fixed top-[60px] left-0 right-0 z-40 bg-cyber-dark/98 border-b border-cyan-500/30 md:hidden max-h-[80vh] overflow-y-auto animate-in slide-in-from-top duration-300">
            {/* 餐别选择 */}
            <div className="p-4 border-b border-cyan-500/20">
              <h3 className="text-xs font-mono text-cyan-400/80 mb-3 uppercase tracking-wider">
                🍽️ 选择餐别
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {mealTypes.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => {
                      onMealSelect(meal.id);
                      setIsOpen(false);
                    }}
                    disabled={isSpinning}
                    className={`px-4 py-3 font-mono text-sm border rounded-lg transition-all duration-300 uppercase tracking-wider min-h-[44px] ${
                      selectedMealId === meal.id
                        ? `bg-${theme.primary}/20 border-${theme.primary} text-${theme.primary} shadow-lg shadow-${theme.primary}/30`
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {meal.emoji} {meal.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 快捷功能 */}
            <div className="p-4 border-b border-cyan-500/20">
              <h3 className="text-xs font-mono text-cyan-400/80 mb-3 uppercase tracking-wider">
                ⚡ 快捷功能
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigate('/feedbacks/submit')}
                  disabled={isSpinning}
                  className="w-full px-4 py-3 font-mono text-sm border border-purple-500/50 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all min-h-[44px] flex items-center gap-3"
                >
                  <span className="text-xl">💬</span>
                  <span>提交反馈</span>
                </button>
                
                <button
                  onClick={() => {
                    onHistoryClick();
                    setIsOpen(false);
                  }}
                  disabled={isSpinning}
                  className="w-full px-4 py-3 font-mono text-sm border border-cyber-pink/50 rounded-lg bg-cyber-pink/20 text-cyber-pink hover:bg-cyber-pink/30 transition-all min-h-[44px] flex items-center gap-3"
                >
                  <span className="text-xl">📋</span>
                  <span>历史记录</span>
                </button>
                
                <button
                  onClick={() => {
                    onSettingsClick();
                    setIsOpen(false);
                  }}
                  disabled={isSpinning}
                  className={`w-full px-4 py-3 font-mono text-sm border rounded-lg ${theme.bg} text-${theme.primary} hover:bg-${theme.primary}/30 transition-all min-h-[44px] flex items-center gap-3`}
                >
                  <span className="text-xl">⚙️</span>
                  <span>设置</span>
                </button>
              </div>
            </div>

            {/* 用户菜单 */}
            {isAuthenticated && (
              <div className="p-4">
                <h3 className="text-xs font-mono text-cyan-400/80 mb-3 uppercase tracking-wider">
                  👤 账户
                </h3>
                <div className="space-y-2">
                  <div className="px-4 py-3 font-mono text-sm border border-gray-700 rounded-lg bg-gray-800/50 text-gray-300 min-h-[44px] flex items-center gap-3">
                    <span className="text-xl">👤</span>
                    <span>{user?.username || '用户'}</span>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleNavigate('/admin')}
                      className="w-full px-4 py-3 font-mono text-sm border border-green-500/50 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all min-h-[44px] flex items-center gap-3"
                    >
                      <span className="text-xl">🔐</span>
                      <span>管理后台</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleNavigate('/feedbacks')}
                    className="w-full px-4 py-3 font-mono text-sm border border-gray-600 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 transition-all min-h-[44px] flex items-center gap-3"
                  >
                    <span className="text-xl">📝</span>
                    <span>我的反馈</span>
                  </button>
                </div>
              </div>
            )}

            {/* 底部信息 */}
            <div className="p-4 border-t border-cyan-500/20 text-center">
              <p className="text-[10px] text-cyber-cyan/30 font-mono uppercase tracking-[0.2em]">
                Ver 2.6.0 // Mobile Menu
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileNav;
