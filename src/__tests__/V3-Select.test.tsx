import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Select from '../../src/components/V3/Select';

describe('V3 Select 组件测试', () => {
  const mockOptions = [
    { value: 'option1', label: '选项 1' },
    { value: 'option2', label: '选项 2' },
    { value: 'option3', label: '选项 3', disabled: true },
  ];

  it('应该渲染选择器', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('应该渲染所有选项', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByText('选项 1')).toBeInTheDocument();
    expect(screen.getByText('选项 2')).toBeInTheDocument();
    expect(screen.getByText('选项 3')).toBeInTheDocument();
  });

  it('应该支持标签', () => {
    render(<Select options={mockOptions} label="选择标签" />);
    expect(screen.getByText('选择标签')).toBeInTheDocument();
  });

  it('应该支持错误消息', () => {
    render(<Select options={mockOptions} error="这是错误信息" />);
    expect(screen.getByText('这是错误信息')).toBeInTheDocument();
  });

  it('应该支持帮助文本', () => {
    render(<Select options={mockOptions} helperText="这是帮助文本" />);
    expect(screen.getByText('这是帮助文本')).toBeInTheDocument();
  });

  it('错误时应该显示红色边框', () => {
    render(<Select options={mockOptions} error="错误" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
  });

  it('应该支持禁用选项', () => {
    render(<Select options={mockOptions} />);
    const option = screen.getByRole('option', { name: '选项 3' });
    expect(option).toBeDisabled();
  });

  it('应该支持自定义 className', () => {
    render(<Select options={mockOptions} className="custom-class" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('应该支持 disabled 属性', () => {
    render(<Select options={mockOptions} disabled />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('应该支持 value 属性', () => {
    render(<Select options={mockOptions} value="option1" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option1');
  });

  it('应该支持 onChange 事件', () => {
    const onChange = vi.fn();
    render(<Select options={mockOptions} onChange={onChange} />);
    const select = screen.getByRole('combobox');
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalled();
  });

  it('应该支持 ref 转发', () => {
    const ref = vi.fn();
    render(<Select options={mockOptions} ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('错误时应该优先显示错误而非帮助文本', () => {
    render(<Select options={mockOptions} error="错误" helperText="帮助" />);
    expect(screen.getByText('错误')).toBeInTheDocument();
    expect(screen.queryByText('帮助')).not.toBeInTheDocument();
  });
});
