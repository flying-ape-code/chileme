/**
 * 转盘服务模块单元测试
 * @module spinService.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSpinRecord, getUserSpinRecords, getAllSpinRecords } from '../lib/spinService';
import { supabase } from '../lib/supabaseClient';

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('转盘服务 - createSpinRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功创建抽奖记录', async () => {
    const mockRecord = {
      id: 'spin-123',
      user_id: 'user-123',
      result: '麦当劳巨无霸',
      points: 100,
      created_at: '2026-04-09T10:00:00Z',
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: mockRecord, error: null }),
    } as any);

    const result = await createSpinRecord('user-123', '麦当劳巨无霸', 100);

    expect(result.success).toBe(true);
    expect(result.record?.result).toBe('麦当劳巨无霸');
    expect(result.record?.points).toBe(100);
  });

  it('应该处理创建失败', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } as any }),
    } as any);

    const result = await createSpinRecord('user-123', '测试商品', 50);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Insert failed');
  });
});

describe('转盘服务 - getUserSpinRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功获取用户抽奖记录', async () => {
    const mockRecords = [
      { id: '1', user_id: 'user-123', result: '商品 A', points: 100 },
      { id: '2', user_id: 'user-123', result: '商品 B', points: 50 },
    ];

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({ data: mockRecords, error: null }),
    } as any);

    const result = await getUserSpinRecords('user-123', 50);

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(2);
  });

  it('应该使用默认 limit 50', async () => {
    const mockRecords = [];

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({ data: mockRecords, error: null }),
    } as any);

    await getUserSpinRecords('user-123');

    expect(supabase.from).toHaveBeenCalled();
  });

  it('应该处理获取失败', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'Query failed' } as any }),
    } as any);

    const result = await getUserSpinRecords('user-123');

    expect(result.success).toBe(false);
  });
});

describe('转盘服务 - getAllSpinRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功获取所有抽奖记录（管理员）', async () => {
    const mockRecords = [
      { 
        id: '1', 
        user_id: 'user-123', 
        result: '商品 A', 
        points: 100,
        user: { username: 'user1', email: 'user1@example.com' }
      },
    ];

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({ data: mockRecords, error: null }),
    } as any);

    const result = await getAllSpinRecords(100);

    expect(result.success).toBe(true);
    expect(result.records).toHaveLength(1);
  });

  it('应该使用默认 limit 100', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
    } as any);

    await getAllSpinRecords();

    expect(supabase.from).toHaveBeenCalled();
  });
});
