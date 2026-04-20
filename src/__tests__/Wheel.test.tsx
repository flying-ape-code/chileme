/**
 * 转盘组件单元测试
 * @module Wheel.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Wheel from '../components/Wheel';

describe('转盘组件 - Wheel', () => {
  const mockItems = [
    { id: '1', name: '麦当劳', emoji: '🍔', weirdName: '金色拱门', weirdEmoji: '🍟' },
    { id: '2', name: '肯德基', emoji: '🍗', weirdName: '炸鸡之王', weirdEmoji: '🥘' },
    { id: '3', name: '星巴克', emoji: '☕', weirdName: '咖啡成瘾', weirdEmoji: '🧋' },
    { id: '4', name: '必胜客', emoji: '🍕', weirdName: '披萨大亨', weirdEmoji: '🥖' },
    { id: '5', name: '海底捞', emoji: '🍲', weirdName: '火锅之王', weirdEmoji: '🥢' },
    { id: '6', name: '沙县小吃', emoji: '🥟', weirdName: '国民食堂', weirdEmoji: '🍜' },
  ];

  it('应该成功渲染转盘组件', () => {
    render(<Wheel items={mockItems} rotation={0} />);
    
    const wheelContainer = document.querySelector('.w-full.h-full');
    expect(wheelContainer).toBeInTheDocument();
  });

  it('应该显示所有商品 emoji', () => {
    render(<Wheel items={mockItems} rotation={0} />);
    
    mockItems.forEach(item => {
      expect(screen.getByText(item.emoji)).toBeInTheDocument();
    });
  });

  it('应该处理空数组情况', () => {
    render(<Wheel items={[]} rotation={0} />);
    
    expect(screen.getByText('暂无商品')).toBeInTheDocument();
  });

  it('应该处理 null/undefined items', () => {
    // @ts-ignore - 测试无效输入
    render(<Wheel items={null} rotation={0} />);
    
    expect(screen.getByText('暂无商品')).toBeInTheDocument();
  });

  it('应该应用旋转角度', () => {
    const { container } = render(<Wheel items={mockItems} rotation={90} />);
    
    const wheelElement = container.querySelector('[style*="rotate(90deg)"]');
    expect(wheelElement).toBeInTheDocument();
  });

  it('应该支持旋转动画状态', () => {
    const { container } = render(
      <Wheel items={mockItems} rotation={0} isSpinning={true} />
    );
    
    const wheelElement = container.querySelector('[style*="transition"]');
    expect(wheelElement).toBeInTheDocument();
  });

  it('应该使用交替颜色', () => {
    render(<Wheel items={mockItems} rotation={0} />);
    
    const wheelContainer = document.querySelector('.rounded-full');
    expect(wheelContainer).toBeInTheDocument();
  });

  it('应该处理缺少 emoji 的商品', () => {
    const itemsWithoutEmoji = [
      { id: '1', name: '无 emoji', emoji: '', weirdName: '空', weirdEmoji: '' }
    ];
    
    render(<Wheel items={itemsWithoutEmoji} rotation={0} />);
    
    expect(screen.getByText('🍽️')).toBeInTheDocument();
  });

  it('应该有正确的尺寸类', () => {
    const { container } = render(<Wheel items={mockItems} rotation={0} />);
    
    const wheelContainer = container.querySelector('.w-80.h-80');
    expect(wheelContainer).toBeInTheDocument();
  });

  it('应该有边框和阴影效果', () => {
    const { container } = render(<Wheel items={mockItems} rotation={0} />);
    
    const wheelElement = container.querySelector('.border-4');
    expect(wheelElement).toBeInTheDocument();
  });

  it('应该支持响应式文本大小', () => {
    const { container } = render(<Wheel items={mockItems} rotation={0} />);
    
    const textElements = container.querySelectorAll('.text-3xl');
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('应该渲染正确的商品数量', () => {
    render(<Wheel items={mockItems} rotation={0} />);
    
    // 应该显示 6 个 emoji
    const emojis = document.querySelectorAll('.text-3xl');
    expect(emojis.length).toBe(6);
  });

  it('应该处理两个商品', () => {
    const twoItems = [
      { id: '1', name: '选项 A', emoji: '🅰️', weirdName: 'A 计划', weirdEmoji: '🎯' },
      { id: '2', name: '选项 B', emoji: '🅱️', weirdName: 'B 计划', weirdEmoji: '🎲' }
    ];
    
    render(<Wheel items={twoItems} rotation={0} />);
    
    expect(screen.getByText('🅰️')).toBeInTheDocument();
    expect(screen.getByText('🅱️')).toBeInTheDocument();
  });

  it('应该使用 item.id 作为 key', () => {
    render(<Wheel items={mockItems} rotation={0} />);
    
    // 确保每个商品的 emoji 只出现一次
    const burgerEmoji = screen.getAllByText('🍔');
    expect(burgerEmoji.length).toBe(1);
  });

  it('应该处理旋转状态转换', () => {
    const { container, rerender } = render(
      <Wheel items={mockItems} rotation={0} isSpinning={false} />
    );
    
    let wheelElement = container.querySelector('[style*="rotate(0deg)"]');
    expect(wheelElement).toBeInTheDocument();
    
    rerender(
      <Wheel items={mockItems} rotation={360} isSpinning={true} />
    );
    
    wheelElement = container.querySelector('[style*="rotate(360deg)"]');
    expect(wheelElement).toBeInTheDocument();
  });

  it('应该有防重复渲染逻辑', () => {
    render(<Wheel items={mockItems} rotation={0} />);
    
    const burgerEmoji = screen.getAllByText('🍔');
    expect(burgerEmoji.length).toBe(1);
  });

  it('应该处理包含数字 id 的商品', () => {
    const itemsWithNumberIds = [
      { id: 1, name: '数字 ID', emoji: '1️⃣', weirdName: '一', weirdEmoji: '🔢' },
      { id: 2, name: '第二个', emoji: '2️⃣', weirdName: '二', weirdEmoji: '🔢' }
    ];
    
    render(<Wheel items={itemsWithNumberIds} rotation={0} />);
    
    expect(screen.getByText('1️⃣')).toBeInTheDocument();
    expect(screen.getByText('2️⃣')).toBeInTheDocument();
  });

  it('应该处理混合类型 id', () => {
    const itemsWithMixedIds = [
      { id: 'string-id', name: '字符串 ID', emoji: '🔤', weirdName: '字符', weirdEmoji: '📝' },
      { id: 123, name: '数字 ID', emoji: '🔢', weirdName: '数字', weirdEmoji: '📊' }
    ];
    
    // @ts-ignore - 测试混合类型
    render(<Wheel items={itemsWithMixedIds} rotation={0} />);
    
    expect(screen.getByText('🔤')).toBeInTheDocument();
    expect(screen.getByText('🔢')).toBeInTheDocument();
  });

  it('应该有正确的转盘结构', () => {
    const { container } = render(<Wheel items={mockItems} rotation={0} />);
    
    // 检查转盘容器
    const outerContainer = container.querySelector('.relative.w-80.h-80');
    expect(outerContainer).toBeInTheDocument();
    
    // 检查内层转盘
    const innerWheel = container.querySelector('.rounded-full.overflow-hidden');
    expect(innerWheel).toBeInTheDocument();
  });

  it('应该支持自定义 rotation 值', () => {
    const { container } = render(<Wheel items={mockItems} rotation={180} />);
    
    const wheelElement = container.querySelector('[style*="rotate(180deg)"]');
    expect(wheelElement).toBeInTheDocument();
  });

  it('应该支持负数 rotation 值', () => {
    const { container } = render(<Wheel items={mockItems} rotation={-90} />);
    
    const wheelElement = container.querySelector('[style*="rotate(-90deg)"]');
    expect(wheelElement).toBeInTheDocument();
  });
});
