// V3.0 BottomTabBar 组件
import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-col items-center justify-center w-full h-full
                  transition-all duration-200
                  ${isActive ? 'text-[#FF6B35]' : 'text-gray-400 hover:text-gray-600'}
                `}
              >
                <div className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`}>
                  {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
                </div>
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-[#FF6B35] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomTabBar;
