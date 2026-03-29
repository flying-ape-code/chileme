import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '../../components/V3/Card';

describe('V3 Card 组件', () => {
  describe('基础渲染', () => {
    it('应该渲染卡片', () => {
      render(<Card>卡片内容</Card>);
      expect(screen.getByText('卡片内容')).toBeInTheDocument();
    });

    it('应该支持 title', () => {
      render(<Card title="卡片标题">内容</Card>);
      expect(screen.getByText('卡片标题')).toBeInTheDocument();
    });

    it('应该支持 footer', () => {
      render(<Card footer="卡片底部">内容</Card>);
      expect(screen.getByText('卡片底部')).toBeInTheDocument();
    });
  });

  describe('尺寸', () => {
    it('应该支持 md 尺寸（默认）', () => {
      render(<Card>内容</Card>);
      const card = screen.getByText('内容').closest('.bg-white');
      expect(card).toHaveClass('p-6');
    });

    it('应该支持 sm 尺寸', () => {
      render(<Card size="sm">内容</Card>);
      const card = screen.getByText('内容').closest('.bg-white');
      expect(card).toHaveClass('p-4');
    });

    it('应该支持 lg 尺寸', () => {
      render(<Card size="lg">内容</Card>);
      const card = screen.getByText('内容').closest('.bg-white');
      expect(card).toHaveClass('p-8');
    });
  });

  describe('变体', () => {
    it('应该支持 default 变体（默认）', () => {
      render(<Card>内容</Card>);
      const card = screen.getByText('内容').closest('.bg-white');
      expect(card).toHaveClass('bg-white');
    });

    it('应该支持 primary 变体', () => {
      render(<Card variant="primary">内容</Card>);
      const card = screen.getByText('内容').closest('.border-\\[\\#FF6B35\\]');
      expect(card).toHaveClass('border-[#FF6B35]');
    });
  });

  describe('交互', () => {
    it('应该支持 hoverable', () => {
      render(<Card hoverable>内容</Card>);
      const card = screen.getByText('内容').closest('div');
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('应该触发 onClick', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>内容</Card>);
      
      fireEvent.click(screen.getByText('内容').parentElement!);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('边框', () => {
    it('应该支持 bordered（默认）', () => {
      render(<Card>内容</Card>);
      const card = screen.getByText('内容').closest('.bg-white');
      expect(card).toHaveClass('border');
    });

    it('应该支持无边框', () => {
      render(<Card bordered={false}>内容</Card>);
      const card = screen.getByText('内容').closest('.bg-white');
      expect(card).not.toHaveClass('border');
    });
  });

  describe('自定义样式', () => {
    it('应该支持自定义 className', () => {
      render(<Card className="custom-card">内容</Card>);
      const card = screen.getByText('内容').closest('.custom-card');
      expect(card).toHaveClass('custom-card');
    });
  });
});
