// V3.0 HomePage 首页组件
import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { BottomTabBar } from './BottomTabBar';
import { ProductCard } from './ProductCard';
import { Button } from './Button';
import { Input } from './Input';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  cpsLink?: string;
  category?: string;
  discount?: number;
}

// 模拟数据
const mockProducts: Product[] = [
  { id: '1', name: '麦当劳巨无霸汉堡套餐', price: 29.9, originalPrice: 39.9, category: '快餐', discount: 25, image: 'https://via.placeholder.com/300x200?text=Burger' },
  { id: '2', name: '肯德基香辣鸡腿堡', price: 19.9, originalPrice: 25.9, category: '快餐', discount: 23 },
  { id: '3', name: '星巴克中杯拿铁', price: 27, originalPrice: 33, category: '饮品', discount: 18 },
  { id: '4', name: '必胜客超级至尊披萨', price: 89, originalPrice: 119, category: '披萨', discount: 25 },
];

const tabs = [
  { id: 'home', label: '首页', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { id: 'history', label: '历史', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { id: 'profile', label: '我的', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const categories = ['全部', '快餐', '饮品', '披萨', '小吃', '甜品'];

  const handleBuy = (product: Product) => {
    console.log('购买:', product);
    if (product.cpsLink) {
      window.open(product.cpsLink, '_blank');
    }
  };

  const handleFavorite = (product: Product) => {
    console.log('收藏:', product);
  };

  const filteredProducts = mockProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === '全部' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar title="吃了么" />
      
      {/* 搜索栏 */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200 p-4">
        <Input
          placeholder="搜索美食..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        
        {/* 分类筛选 */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* 商品列表 */}
      <main className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuy={handleBuy}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>暂无商品</p>
          </div>
        )}
      </main>

      <BottomTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default HomePage;
