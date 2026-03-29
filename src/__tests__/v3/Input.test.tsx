import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../../components/V3/Input';

describe('V3 Input 组件', () => {
  describe('基础渲染', () => {
    it('应该渲染输入框', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('应该支持 placeholder', () => {
      render(<Input placeholder="请输入..." />);
      expect(screen.getByPlaceholderText('请输入...')).toBeInTheDocument();
    });

    it('应该支持 defaultValue', () => {
      render(<Input defaultValue="默认值" />);
      expect(screen.getByRole('textbox')).toHaveValue('默认值');
    });
  });

  describe('Value 和 onChange', () => {
    it('应该支持受控 value', () => {
      render(<Input value="受控值" onChange={vi.fn()} />);
      expect(screen.getByRole('textbox')).toHaveValue('受控值');
    });

    it('应该触发 onChange 回调', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      
      fireEvent.change(screen.getByRole('textbox'), { target: { value: '测试' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('onChange 应该接收 event 参数', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'A' } });
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ value: 'A' })
      }));
    });
  });

  describe('Disabled 和 ReadOnly', () => {
    it('应该支持 disabled 状态', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('应该支持 readOnly 状态', () => {
      render(<Input readOnly />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });
  });

  describe('Type 类型', () => {
    it('应该支持 text 类型（默认）', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('应该支持 email 类型', () => {
      render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('应该支持 password 类型', () => {
      render(<Input type="password" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');
    });

    it('应该支持 number 类型', () => {
      render(<Input type="number" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'number');
    });
  });

  describe('尺寸', () => {
    it('应该支持 md 尺寸（默认）', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-4 py-2 text-base');
    });

    it('应该支持 sm 尺寸', () => {
      render(<Input size="sm" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-3 py-1.5 text-sm');
    });

    it('应该支持 lg 尺寸', () => {
      render(<Input size="lg" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-4 py-3 text-lg');
    });
  });

  describe('错误状态', () => {
    it('应该支持 error 状态', () => {
      render(<Input error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-[#EF5350]');
    });

    it('非 error 状态不应该有错误样式', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('border-[#EF5350]');
    });
  });

  describe('自定义样式', () => {
    it('应该支持自定义 className', () => {
      render(<Input className="custom-class" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });
  });

  describe('HTML 属性透传', () => {
    it('应该支持 id 属性', () => {
      render(<Input id="test-input" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'test-input');
    });

    it('应该支持 name 属性', () => {
      render(<Input name="username" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
    });

    it('应该支持 aria 属性', () => {
      render(<Input aria-label="测试输入框" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', '测试输入框');
    });

    it('应该支持 required 属性', () => {
      render(<Input required />);
      expect(screen.getByRole('textbox')).toHaveAttribute('required');
    });

    it('应该支持 maxLength 属性', () => {
      render(<Input maxLength={50} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '50');
    });
  });
});
