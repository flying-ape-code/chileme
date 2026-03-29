import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '../../components/V3/Checkbox';

describe('V3 Checkbox 组件', () => {
  describe('基础渲染', () => {
    it('应该渲染复选框', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('应该支持 label', () => {
      render(<Checkbox label="同意条款" />);
      expect(screen.getByText('同意条款')).toBeInTheDocument();
    });

    it('应该支持默认未选中', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('应该支持默认选中', () => {
      render(<Checkbox defaultChecked />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('受控模式', () => {
    it('应该支持 checked 属性', () => {
      render(<Checkbox checked onChange={vi.fn()} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('应该支持 unchecked 属性', () => {
      render(<Checkbox checked={false} onChange={vi.fn()} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('应该触发 onChange 回调', () => {
      const handleChange = vi.fn();
      render(<Checkbox onChange={handleChange} />);
      
      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('onChange 应该接收 checked 状态', () => {
      const handleChange = vi.fn();
      render(<Checkbox onChange={handleChange} />);
      
      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ checked: true })
      }));
    });
  });

  describe('Disabled 状态', () => {
    it('应该支持 disabled 状态', () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('disabled 时不应该触发 onChange', () => {
      const handleChange = vi.fn();
      render(<Checkbox disabled onChange={handleChange} />);
      
      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('自定义样式', () => {
    it('应该支持自定义 className', () => {
      render(<Checkbox className="custom-checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('custom-checkbox');
    });
  });

  describe('HTML 属性透传', () => {
    it('应该支持 id 属性', () => {
      render(<Checkbox id="test-checkbox" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'test-checkbox');
    });

    it('应该支持 name 属性', () => {
      render(<Checkbox name="agree" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('name', 'agree');
    });

    it('应该支持 required 属性', () => {
      render(<Checkbox required />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('required');
    });
  });
});
