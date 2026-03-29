import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '../../components/V3/Select';

describe('V3 Select 组件', () => {
  const options = [
    { value: '1', label: '选项 1' },
    { value: '2', label: '选项 2' },
    { value: '3', label: '选项 3' },
  ];

  describe('基础渲染', () => {
    it('应该渲染选择框', () => {
      render(<Select options={options} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('应该渲染所有选项', () => {
      render(<Select options={options} />);
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('应该显示选项文本', () => {
      render(<Select options={options} />);
      expect(screen.getByText('选项 1')).toBeInTheDocument();
      expect(screen.getByText('选项 2')).toBeInTheDocument();
    });

    it('应该支持 placeholder', () => {
      render(<Select options={options} placeholder="请选择" />);
      expect(screen.getByRole('combobox')).toHaveValue('');
    });
  });

  describe('默认值', () => {
    it('应该支持 defaultValue', () => {
      render(<Select options={options} defaultValue="2" />);
      expect(screen.getByRole('combobox')).toHaveValue('2');
    });
  });

  describe('受控模式', () => {
    it('应该支持 value 属性', () => {
      render(<Select options={options} value="1" onChange={vi.fn()} />);
      expect(screen.getByRole('combobox')).toHaveValue('1');
    });

    it('应该触发 onChange 回调', () => {
      const handleChange = vi.fn();
      render(<Select options={options} onChange={handleChange} />);
      
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('onChange 应该接收 event 参数', () => {
      const handleChange = vi.fn();
      render(<Select options={options} onChange={handleChange} />);
      
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } });
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ value: '3' })
      }));
    });
  });

  describe('Disabled 状态', () => {
    it('应该支持 disabled 状态', () => {
      render(<Select options={options} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('disabled 时不应该触发 onChange', () => {
      const handleChange = vi.fn();
      render(<Select options={options} disabled onChange={handleChange} />);
      
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('尺寸', () => {
    it('应该支持 md 尺寸（默认）', () => {
      render(<Select options={options} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('px-4 py-2 text-base');
    });

    it('应该支持 sm 尺寸', () => {
      render(<Select options={options} size="sm" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('px-3 py-1.5 text-sm');
    });

    it('应该支持 lg 尺寸', () => {
      render(<Select options={options} size="lg" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('px-4 py-3 text-lg');
    });
  });

  describe('错误状态', () => {
    it('应该支持 error 状态', () => {
      render(<Select options={options} error />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-[#EF5350]');
    });

    it('非 error 状态不应该有错误样式', () => {
      render(<Select options={options} />);
      const select = screen.getByRole('combobox');
      expect(select).not.toHaveClass('border-[#EF5350]');
    });
  });

  describe('自定义样式', () => {
    it('应该支持自定义 className', () => {
      render(<Select options={options} className="custom-select" />);
      expect(screen.getByRole('combobox')).toHaveClass('custom-select');
    });
  });

  describe('HTML 属性透传', () => {
    it('应该支持 id 属性', () => {
      render(<Select options={options} id="test-select" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('id', 'test-select');
    });

    it('应该支持 name 属性', () => {
      render(<Select options={options} name="category" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('name', 'category');
    });

    it('应该支持 required 属性', () => {
      render(<Select options={options} required />);
      expect(screen.getByRole('combobox')).toHaveAttribute('required');
    });

    it('应该支持 aria 属性', () => {
      render(<Select options={options} aria-label="测试选择框" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', '测试选择框');
    });
  });
});
