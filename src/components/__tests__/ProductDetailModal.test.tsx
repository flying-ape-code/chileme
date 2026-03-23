import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductDetailModal from '../ProductDetailModal';
import { Product } from '../../lib/productService';

// Mock jumpToCoupon
vi.mock('../../services/cps-jump', () => ({
  jumpToCoupon: vi.fn()
}));

const mockProduct: Product = {
  id: 'test-product-1',
  name: '测试商品',
  img: 'https://example.com/image.jpg',
  promo_url: 'https://example.com/promo',
  category: 'lunch',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('ProductDetailModal', () => {
  const mockOnClose = vi.fn();
  const mockOnToggleFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('不显示当 isOpen 为 false', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={false}
        onClose={mockOnClose}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    expect(screen.queryByText('测试商品')).not.toBeInTheDocument();
  });

  it('显示商品详情当 isOpen 为 true', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    expect(screen.getByText('测试商品')).toBeInTheDocument();
    expect(screen.getByText(/去点餐/)).toBeInTheDocument();
    expect(screen.getByText(/收藏/)).toBeInTheDocument();
  });

  it('点击关闭按钮调用 onClose', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    const closeButton = screen.getByLabelText('关闭');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('点击背景调用 onClose', () => {
    const { container } = render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    const backdrop = container.firstChild as HTMLDivElement;
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('点击去点餐按钮调用 jumpToCoupon', async () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    const orderButton = screen.getByText(/去点餐/);
    fireEvent.click(orderButton);

    const { jumpToCoupon } = await import('../../services/cps-jump');
    expect(jumpToCoupon).toHaveBeenCalledWith({
      couponId: mockProduct.id,
      couponLink: mockProduct.promo_url,
      source: 'detail'
    });
  });

  it('点击收藏按钮调用 onToggleFavorite', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    const favoriteButton = screen.getByText('🤍 收藏');
    fireEvent.click(favoriteButton);

    expect(mockOnToggleFavorite).toHaveBeenCalledWith(mockProduct.id);
  });

  it('显示已收藏状态', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        isFavorite={true}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    expect(screen.getByText('❤️ 已收藏')).toBeInTheDocument();
  });

  it('按 ESC 键关闭弹窗', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
