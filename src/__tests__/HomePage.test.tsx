/**
 * 首页页面单元测试
 * @module HomePage.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '../components/V3/HomePage';

// Mock 子组件
vi.mock('../components/V3/Navbar', () => ({
  Navbar: ({ title }: { title: string }) => <div data-testid="navbar">{title}</div>,
}));

vi.mock('../components/V3/BottomTabBar', () => ({
  BottomTabBar: ({ tabs, activeTab, onTabChange }: any) => (
    <div data-testid="tabbar">
      {tabs.map((tab: any) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={activeTab === tab.id ? 'active' : ''}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../components/V3/ProductCard', () => ({
  ProductCard: ({ product, onBuy, onFavorite }: any) => (
    <div data-testid="product-card" data-product-id={product.id}>
      <h3>{product.name}</h3>
      <p>¥{product.price}</p>
      <button onClick={() => onBuy(product)}>购买</button>
      <button onClick={() => onFavorite(product)}>收藏</button>
    </div>
  ),
}));

vi.mock('../components/V3/Button', () => ({
  Button: ({ children, variant, onClick }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

vi.mock('../components/V3/Input', () => ({
  Input: ({ placeholder, value, onChange, leftIcon }: any) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  ),
}));

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe('首页页面 - HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功渲染页面标题', () => {
    renderHomePage();
    expect(screen.getByTestId('navbar')).toHaveTextContent('吃了么');
  });

  it('应该显示搜索栏', () => {
    renderHomePage();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toHaveAttribute('placeholder', '搜索美食...');
  });

  it('应该显示分类筛选按钮', () => {
    renderHomePage();
    
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBeGreaterThan(5);
    
    // 应该包含"全部"分类
    const allCategory = buttons.find(btn => btn.textContent === '全部');
    expect(allCategory).toBeInTheDocument();
  });

  it('应该默认选中"全部"分类', () => {
    renderHomePage();
    
    const buttons = screen.getAllByTestId('button');
    const allButton = buttons.find(btn => btn.textContent === '全部');
    expect(allButton).toHaveAttribute('data-variant', 'primary');
  });

  it('应该可以切换分类', () => {
    renderHomePage();
    
    const buttons = screen.getAllByTestId('button');
    const kuaicanButton = buttons.find(btn => btn.textContent === '快餐');
    
    expect(kuaicanButton).toBeInTheDocument();
    fireEvent.click(kuaicanButton!);
    
    // 点击后应该变为选中状态
    expect(kuaicanButton).toHaveAttribute('data-variant', 'primary');
  });

  it('应该显示商品列表', () => {
    renderHomePage();
    
    const productCards = screen.getAllByTestId('product-card');
    expect(productCards.length).toBeGreaterThan(0);
  });

  it('应该显示商品名称', () => {
    renderHomePage();
    
    expect(screen.getByText('麦当劳巨无霸汉堡套餐')).toBeInTheDocument();
    expect(screen.getByText('肯德基香辣鸡腿堡')).toBeInTheDocument();
    expect(screen.getByText('星巴克中杯拿铁')).toBeInTheDocument();
    expect(screen.getByText('必胜客超级至尊披萨')).toBeInTheDocument();
  });

  it('应该显示商品价格', () => {
    renderHomePage();
    
    expect(screen.getByText('¥29.9')).toBeInTheDocument();
    expect(screen.getByText('¥19.9')).toBeInTheDocument();
    expect(screen.getByText('¥27')).toBeInTheDocument();
    expect(screen.getByText('¥89')).toBeInTheDocument();
  });

  it('应该可以搜索商品', () => {
    renderHomePage();
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: '麦当劳' } });
    
    expect(searchInput).toHaveValue('麦当劳');
  });

  it('应该可以切换底部标签页', () => {
    renderHomePage();
    
    const tabButtons = screen.getByTestId('tabbar').querySelectorAll('button');
    expect(tabButtons.length).toBe(3);
    
    // 默认选中"首页"
    expect(tabButtons[0]).toHaveClass('active');
    
    // 点击"历史"标签
    fireEvent.click(tabButtons[1]);
    expect(tabButtons[1]).toHaveClass('active');
    
    // 点击"我的"标签
    fireEvent.click(tabButtons[2]);
    expect(tabButtons[2]).toHaveClass('active');
  });

  it('应该显示正确的分类列表', () => {
    renderHomePage();
    
    const categories = ['全部', '快餐', '饮品', '披萨', '小吃', '甜品'];
    
    categories.forEach(cat => {
      const button = screen.getAllByTestId('button').find(btn => btn.textContent === cat);
      expect(button).toBeInTheDocument();
    });
  });

  it('应该响应式布局', () => {
    const { container } = renderHomePage();
    
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer?.className).toContain('bg-gray-50');
    expect(mainContainer?.className).toContain('pb-20');
  });

  it('应该有空状态处理', () => {
    renderHomePage();
    
    // 搜索不存在的商品
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: '不存在的商品' } });
    
    // 应该没有商品卡片
    const productCards = screen.queryAllByTestId('product-card');
    expect(productCards.length).toBe(0);
  });
});
