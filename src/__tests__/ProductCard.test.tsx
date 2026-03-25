import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../components/ProductCard';

describe('ProductCard 组件测试', () => {
  const mockProduct = {
    id: '1',
    name: '测试商品',
    img: 'https://example.com/image.jpg',
    promo_url: 'https://example.com/promo',
    cps_link: 'https://example.com/cps',
    category: 'breakfast',
    is_active: true,
    sort_order: 1,
    created_at: '2026-03-25T00:00:00Z',
    updated_at: '2026-03-25T00:00:00Z',
  };

  const renderComponent = (props = {}) => {
    return render(
      <ProductCard product={mockProduct} {...props} />
    );
  };

  it('应该渲染商品名称', () => {
    renderComponent();
    expect(screen.getByText('测试商品')).toBeInTheDocument();
  });

  it('应该渲染商品图片', () => {
    renderComponent();
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('alt', '测试商品');
  });

  it('应该显示领券标签', () => {
    renderComponent();
    expect(screen.getByText('🎁 领券')).toBeInTheDocument();
  });

  it('应该显示价格', () => {
    renderComponent();
    expect(screen.getByText(/¥15 起/)).toBeInTheDocument();
  });

  it('应该显示去点餐按钮', () => {
    renderComponent();
    expect(screen.getByText('🎁 去点餐')).toBeInTheDocument();
  });

  it('应该显示配送信息', () => {
    renderComponent();
    expect(screen.getByText(/📍/)).toBeInTheDocument();
    expect(screen.getByText(/⏱️/)).toBeInTheDocument();
    expect(screen.getByText(/⭐/)).toBeInTheDocument();
  });

  it('应该处理点击事件', () => {
    const onOrderClick = vi.fn();
    renderComponent({ onOrderClick });
    const button = screen.getByText('🎁 去点餐');
    fireEvent.click(button);
    expect(onOrderClick).toHaveBeenCalledWith(mockProduct);
  });

  it('没有 promo_url 时不显示按钮', () => {
    const productWithoutPromo = { ...mockProduct, promo_url: null };
    render(<ProductCard product={productWithoutPromo} />);
    expect(screen.queryByText('🎁 去点餐')).not.toBeInTheDocument();
  });
});
