import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getThemeConfig, type AppSettings } from '../lib/settings';

interface BottomTabBarProps {
  isSpinning: boolean;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  settings: AppSettings;
}

const BottomTabBar = ({ isSpinning, onHistoryClick, onSettingsClick, settings }: BottomTabBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = getThemeConfig(settings.themeColor);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const tabs = [
    {
      id: 'home',
      label: '首页',
      icon: '🏠',
      path: '/',
      action: () => navigate('/')
    },
    {
      id: 'history',
      label: '历史',
      icon: '📋',
      path: '/history',
      action: () => {
        if (!isSpinning) onHistoryClick();
      }
    },
    {
      id: 'feedback',
      label: '反馈',
      icon: '💬',
      path: '/feedbacks/submit',
      action: () => {
        if (!isSpinning) navigate('/feedbacks/submit');
      }
    },
    {
      id: 'profile',
      label: '我的',
      icon: '👤',
      path: '/feedbacks',
      action: () => navigate('/feedbacks')
    },
    {
      id: 'more',
      label: '更多',
      icon: '⋯',
      path: '/settings',
      action: () => {
        if (!isSpinning) onSettingsClick();
      }
    }
  ];

  return (
    <>
      {/* 桌面端隐藏 */}
      <div className="hidden md:block" aria-hidden="true" />
      
      {/* 移动端底部导航栏 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-cyber-dark/95 backdrop-blur-sm border-t border-cyan-500/20 safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                disabled={isSpinning && tab.id !== 'home'}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-300 min-h-[56px] ${
                  active
                    ? `bg-${theme.primary}/20 text-${theme.primary}`
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
              >
                <span className="text-xl mb-1">{tab.icon}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider">
                  {tab.label}
                </span>
                {active && (
                  <div className={`absolute bottom-1 w-8 h-0.5 bg-${theme.primary} rounded-full shadow-[0_0_8px_rgba(0,247,255,0.8)]`} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 底部占位，防止内容被遮挡 */}
      <div className="md:hidden h-[72px]" aria-hidden="true" />
    </>
  );
};

export default BottomTabBar;
