// V3.0 ProfilePage 个人中心页组件
import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { BottomTabBar } from './BottomTabBar';
import { Card } from './Card';
import { Button } from './Button';

const tabs = [
  { id: 'home', label: '首页', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { id: 'history', label: '历史', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { id: 'profile', label: '我的', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}

const MenuCard: React.FC<{ title: string; items: MenuItem[] }> = ({ title, items }) => (
  <Card className="mt-4">
    <div className="px-4 py-3 border-b border-gray-100">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    </div>
    <div>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 text-[#FF6B35]">{item.icon}</div>
            <span className="text-base text-gray-900">{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.badge && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  </Card>
);

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const menuItems1: MenuItem[] = [
    { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>, label: '我的收藏', badge: 3 },
    { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, label: '消息通知', badge: 12 },
  ];

  const menuItems2: MenuItem[] = [
    { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, label: '设置' },
    { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: '帮助与反馈' },
    { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: '关于我们' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar title="个人中心" />
      
      <main className="p-4">
        {/* 用户信息卡片 */}
        <Card className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white">
          <div className="flex items-center gap-4 p-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">用户</h2>
              <p className="text-sm text-white/80 mt-1">ID: 12345678</p>
            </div>
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-[#FF6B35]">
              编辑
            </Button>
          </div>
          
          {/* 统计信息 */}
          <div className="flex border-t border-white/20 mt-4 pt-4">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-white/80 mt-1">收藏</p>
            </div>
            <div className="flex-1 text-center border-l border-white/20">
              <p className="text-2xl font-bold">48</p>
              <p className="text-xs text-white/80 mt-1">订单</p>
            </div>
            <div className="flex-1 text-center border-l border-white/20">
              <p className="text-2xl font-bold">¥1,280</p>
              <p className="text-xs text-white/80 mt-1">节省</p>
            </div>
          </div>
        </Card>

        {/* VIP 入口 */}
        <Card hoverable className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-400">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white">开通 VIP</h3>
                <p className="text-xs text-white/80">享受专属优惠和特权</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-orange-500">
              立即开通
            </Button>
          </div>
        </Card>

        <MenuCard title="常用" items={menuItems1} />
        <MenuCard title="其他" items={menuItems2} />
      </main>

      <BottomTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ProfilePage;
