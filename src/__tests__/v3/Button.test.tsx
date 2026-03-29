import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/V3/Button';

describe('V3 Button 组件', () => {
  describe('基础渲染', () => {
    it('应该渲染按钮', () => {
      render(<Button>点击我</Button>);
      expect(screen.getByRole('button', { name: '点击我' })).toBeInTheDocument();
    });

    it('应该显示按钮文本', () => {
      render(<Button>提交</Button>);
      expect(screen.getByText('提交')).toBeInTheDocument();
    });
  });

  describe('Variant 变体', () => {
    it('应该支持 primary 变体（默认）', () => {
      render(<Button>主要按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[#FF6B35]');
    });

    it('应该支持 secondary 变体', () => {
      render(<Button variant="secondary">次要按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[#2E86AB]');
    });

    it('应该支持 outline 变体', () => {
      render(<Button variant="outline">边框按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2 border-[#FF6B35]');
    });

    it('应该支持 ghost 变体', () => {
      render(<Button variant="ghost">幽灵按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('bg-');
    });
  });

  describe('Size 尺寸', () => {
    it('应该支持 md 尺寸（默认）', () => {
      render(<Button>中等按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4 py-2 text-base');
    });

    it('应该支持 sm 尺寸', () => {
      render(<Button size="sm">小按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3 py-1.5 text-sm');
    });

    it('应该支持 lg 尺寸', () => {
      render(<Button size="lg">大按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6 py-3 text-lg');
    });
  });

  describe('Disabled 和 Loading 状态', () => {
    it('应该支持 disabled 状态', () => {
      render(<Button disabled>禁用按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('应该支持 loading 状态', () => {
      render(<Button loading>加载中</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('loading 时应该显示加载图标', () => {
      render(<Button loading>加载中</Button>);
      const svg = document.querySelector('svg.animate-spin');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('点击事件', () => {
    it('应该触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>点击</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disabled 时不应该触发 onClick', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>禁用</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('loading 时不应该触发 onClick', () => {
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>加载中</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('自定义样式', () => {
    it('应该支持自定义 className', () => {
      render(<Button className="custom-class">自定义</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('HTML 属性透传', () => {
    it('应该支持 type 属性', () => {
      render(<Button type="submit">提交</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('应该支持 id 属性', () => {
      render(<Button id="test-button">按钮</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('id', 'test-button');
    });

    it('应该支持 aria 属性', () => {
      render(<Button aria-label="测试按钮">按钮</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', '测试按钮');
    });
  });
});
