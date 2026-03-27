// V3.0 HistoryPage 历史记录页组件
import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { BottomTabBar } from './BottomTabBar';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';

interface HistoryItem {
  id: string;
  productName: string;
  price: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  image?: string;
}

const mockHistory: HistoryItem[] = [
  { id: '1', productName: '麦当劳巨无霸套餐', price: 29.9, date: '2026-03-27 12:30', status: 'completed', image: 'https://via.placeholder.com/80' },
  { id: '2', productName: '肯德基香辣鸡腿堡', price: 19.9, date: '2026-03-26 18:20', status: 'completed' },
  { id: '3', productName: '星巴克中杯拿铁', price: 27, date: '2026-03-25 09:15', status: 'cancelled' },
];

const tabs = [
  { id: 'home', label: '首页', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { id: 'history', label: '历史', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { id: 'profile', label: '我的', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = mockHistory.filter(item => {
    const matchFilter = filter === 'all' || item.status === filter;
    const matchSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '进行中';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar title="历史记录" showBack />
      
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200 p-4">
        <Input
          placeholder="搜索历史记录..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="flex gap-2 mt-3">
          <Button variant={filter === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('all')}>
            全部
          </Button>
          <Button variant={filter === 'completed' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('completed')}>
            已完成
          </Button>
          <Button variant={filter === 'cancelled' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('cancelled')}>
            已取消
          </Button>
        </div>
      </div>

      <main className="p-4 space-y-3">
        {filteredHistory.map((item) => (
          <Card key={item.id} hoverable className="p-4">
            <div className="flex gap-4">
              {item.image ? (
                <img src={item.image} alt={item.productName} className="w-20 h-20 object-cover rounded-lg" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{item.productName}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.date}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                  <span className="text-lg font-bold text-[#FF6B35]">¥{item.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {filteredHistory.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>暂无历史记录</p>
          </div>
        )}
      </main>

      <BottomTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default HistoryPage;
