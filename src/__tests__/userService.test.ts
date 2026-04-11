/**
 * 用户服务模块单元测试
 * @module userService.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
  },
}));

import { getAllUsers, getUserById, updateUserRole, updateUser, deleteUser } from '../lib/userService';
import { supabase } from '../lib/supabaseClient';

describe('用户服务 - getAllUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功获取所有用户列表', async () => {
    const mockUsers = [
      { id: '1', username: 'user1', email: 'user1@example.com', role: 'user' },
      { id: '2', username: 'admin', email: 'admin@example.com', role: 'admin' },
    ];

    vi.mocked(supabase.from().select().order).mockResolvedValue({ data: mockUsers, error: null });

    const result = await getAllUsers();

    expect(result.success).toBe(true);
    expect(result.users).toHaveLength(2);
  });

  it('应该处理获取用户失败', async () => {
    vi.mocked(supabase.from().select().order).mockResolvedValue({ data: null, error: { message: 'Database error' } });

    const result = await getAllUsers();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Database error');
  });
});

describe('用户服务 - getUserById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功获取指定用户', async () => {
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    };

    vi.mocked(supabase.from().select().eq().single).mockResolvedValue({ data: mockUser, error: null });

    const result = await getUserById('user-123');

    expect(result.success).toBe(true);
    expect(result.user?.username).toBe('testuser');
  });

  it('应该处理用户不存在', async () => {
    vi.mocked(supabase.from().select().eq().single).mockResolvedValue({ data: null, error: { message: 'User not found' } });

    const result = await getUserById('non-existent');

    expect(result.success).toBe(false);
  });
});

describe('用户服务 - updateUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功更新用户角色', async () => {
    const mockUpdatedUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
    };

    vi.mocked(supabase.from().update().eq().select().single).mockResolvedValue({ data: mockUpdatedUser, error: null });

    const result = await updateUserRole('user-123', 'admin');

    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('admin');
  });

  it('应该处理更新失败', async () => {
    vi.mocked(supabase.from().update().eq().select().single).mockResolvedValue({ data: null, error: { message: 'Update failed' } });

    const result = await updateUserRole('user-123', 'admin');

    expect(result.success).toBe(false);
  });
});

describe('用户服务 - updateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功更新用户信息', async () => {
    const mockUpdatedUser = {
      id: 'user-123',
      username: 'newusername',
      email: 'new@example.com',
      role: 'user',
    };

    vi.mocked(supabase.from().update().eq().select().single).mockResolvedValue({ data: mockUpdatedUser, error: null });

    const result = await updateUser('user-123', {
      username: 'newusername',
      email: 'new@example.com',
    });

    expect(result.success).toBe(true);
    expect(result.user?.username).toBe('newusername');
  });
});

describe('用户服务 - deleteUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功删除用户', async () => {
    vi.mocked(supabase.from().delete().eq).mockResolvedValue({ error: null });

    const result = await deleteUser('user-123');

    expect(result).toBe(true);
  });

  it('应该处理删除失败', async () => {
    vi.mocked(supabase.from().delete().eq).mockResolvedValue({ error: { message: 'Delete failed' } });

    const result = await deleteUser('user-123');

    expect(result).toBe(false);
  });
});
