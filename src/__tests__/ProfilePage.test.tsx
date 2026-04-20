/**
 * 个人中心页面单元测试
 * @module ProfilePage.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../components/V3/ProfilePage';

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

vi.mock('../components/V3/Card', () => ({
  Card: ({ children, className, onClick, hoverable }: any) => (
    <div 
      data-testid="card" 
      className={className} 
      onClick={onClick}
      data-hoverable={hoverable}
    >
      {children}
    </div>
  ),
}));

vi.mock('../components/V3/Button', () => ({
  Button: ({ children, variant, size, className, onClick }: any) => (
    <button 
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

const renderProfilePage = () => {
  return render(
    <BrowserRouter>
      <ProfilePage />
    </BrowserRouter>
  );
};

describe('个人中心页面 - ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功渲染页面标题', () => {
    renderProfilePage();
    expect(screen.getByTestId('navbar')).toHaveTextContent('个人中心');
  });

  it('应该显示用户信息卡片', () => {
    renderProfilePage();
    
    expect(screen.getByText('用户')).toBeInTheDocument();
    expect(screen.getByText(/ID: 12345678/)).toBeInTheDocument();
  });

  it('应该显示编辑资料按钮', () => {
    renderProfilePage();
    
    const buttons = screen.getAllByTestId('button');
    const editButton = buttons.find(btn => btn.textContent === '编辑');
    expect(editButton).toBeInTheDocument();
    // 检查按钮样式（白色边框）
    expect(editButton?.className).toContain('border-white');
    expect(editButton?.className).toContain('text-white');
  });

  it('应该显示统计信息', () => {
    renderProfilePage();
    
    // 检查页面上包含统计信息
    expect(screen.getByText('收藏')).toBeInTheDocument();
    expect(screen.getByText('订单')).toBeInTheDocument();
    expect(screen.getByText('节省')).toBeInTheDocument();
  });

  it('应该显示 VIP 入口', () => {
    renderProfilePage();
    
    expect(screen.getByText('开通 VIP')).toBeInTheDocument();
    expect(screen.getByText('享受专属优惠和特权')).toBeInTheDocument();
    expect(screen.getByText('立即开通')).toBeInTheDocument();
  });

  it('应该显示用餐喜好入口', () => {
    renderProfilePage();
    
    expect(screen.getByText('用餐喜好')).toBeInTheDocument();
    expect(screen.getByText('个性化推荐')).toBeInTheDocument();
  });

  it('应该显示常用菜单项', () => {
    renderProfilePage();
    
    expect(screen.getByText('我的收藏')).toBeInTheDocument();
    expect(screen.getByText('消息通知')).toBeInTheDocument();
  });

  it('应该显示其他菜单项', () => {
    renderProfilePage();
    
    expect(screen.getByText('设置')).toBeInTheDocument();
    expect(screen.getByText('帮助与反馈')).toBeInTheDocument();
    expect(screen.getByText('关于我们')).toBeInTheDocument();
  });

  it('应该显示徽章计数 - 收藏', () => {
    renderProfilePage();
    
    const badges = screen.getAllByText('3');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('应该显示徽章计数 - 消息', () => {
    renderProfilePage();
    
    const notificationsItem = screen.getByText('消息通知').closest('button');
    expect(notificationsItem?.textContent).toContain('12');
  });

  it('应该可以切换底部标签页', () => {
    renderProfilePage();
    
    const tabButtons = screen.getByTestId('tabbar').querySelectorAll('button');
    expect(tabButtons.length).toBe(3);
    expect(tabButtons[0]).toHaveTextContent('首页');
    expect(tabButtons[1]).toHaveTextContent('历史');
    expect(tabButtons[2]).toHaveTextContent('我的');
    
    expect(tabButtons[2]).toHaveClass('active');
    
    fireEvent.click(tabButtons[0]);
    expect(tabButtons[0]).toHaveClass('active');
    
    fireEvent.click(tabButtons[1]);
    expect(tabButtons[1]).toHaveClass('active');
  });

  it('应该可以点击编辑按钮', () => {
    renderProfilePage();
    
    const buttons = screen.getAllByTestId('button');
    const editButton = buttons.find(btn => btn.textContent === '编辑');
    expect(editButton).toBeInTheDocument();
    expect(editButton).not.toBeDisabled();
  });

  it('应该可以点击 VIP 开通按钮', () => {
    renderProfilePage();
    
    const buttons = screen.getAllByTestId('button');
    const vipButton = buttons.find(btn => btn.textContent === '立即开通');
    expect(vipButton).toBeInTheDocument();
    expect(vipButton).not.toBeDisabled();
  });

  it('应该可以点击菜单项', () => {
    renderProfilePage();
    
    const menuButtons = screen.getAllByRole('button');
    expect(menuButtons.length).toBeGreaterThan(5);
  });

  it('应该使用正确的样式类', () => {
    renderProfilePage();
    
    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBeGreaterThan(0);
    
    const vipCard = cards.find(card => 
      card.className?.includes('from-yellow-400')
    );
    expect(vipCard).toBeInTheDocument();
  });

  it('应该渲染正确的菜单图标', () => {
    renderProfilePage();
    
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(10);
  });

  it('应该显示常用和其他分组标题', () => {
    renderProfilePage();
    
    expect(screen.getByText('常用')).toBeInTheDocument();
    expect(screen.getByText('其他')).toBeInTheDocument();
  });

  it('应该响应式布局', () => {
    const { container } = renderProfilePage();
    
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer?.className).toContain('bg-gray-50');
    expect(mainContainer?.className).toContain('pb-20');
  });
});
