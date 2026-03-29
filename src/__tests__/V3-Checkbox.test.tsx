import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from '../../src/components/V3/Checkbox';

describe('V3 Checkbox 组件测试', () => {
  it('应该渲染复选框', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('应该支持标签', () => {
    render(<Checkbox label="复选框标签" />);
    expect(screen.getByText('复选框标签')).toBeInTheDocument();
  });

  it('应该支持错误消息', () => {
    render(<Checkbox error="这是错误信息" />);
    expect(screen.getByText('这是错误信息')).toBeInTheDocument();
  });

  it('应该支持自定义 className', () => {
    render(<Checkbox className="custom-class" />);
    expect(screen.getByRole('checkbox')).toHaveClass('custom-class');
  });

  it('应该支持 disabled 属性', () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('应该支持 checked 属性', () => {
    render(<Checkbox checked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('应该支持 onChange 事件', () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('应该支持默认 unchecked 状态', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('应该支持自定义 ID', () => {
    render(<Checkbox id="custom-id" label="标签" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.id).toBe('custom-id');
  });

  it('标签应该关联到复选框', () => {
    render(<Checkbox id="test-id" label="标签" />);
    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('标签');
    expect(label).toHaveAttribute('for', 'test-id');
  });

  it('错误时应该显示红色边框', () => {
    render(<Checkbox error="错误" />);
    expect(screen.getByRole('checkbox')).toHaveClass('border-red-500');
  });

  it('应该使用主题色', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toHaveClass('text-[#FF6B35]');
  });

  it('应该支持默认 checked', () => {
    render(<Checkbox defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
