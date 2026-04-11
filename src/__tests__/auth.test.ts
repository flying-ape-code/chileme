/**
 * 认证模块单元测试
 * @module auth.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { register, login, logout, getCurrentUser, isLoggedIn, isAdmin } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

describe('认证模块 - register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功注册新用户', async () => {
    const mockAuthData = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    };

    const mockProfileData = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    };

    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({ data: mockAuthData, error: null });
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: mockProfileData, error: null }),
    } as any);

    const result = await register('testuser', 'test@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(result.user?.username).toBe('testuser');
    expect(result.user?.email).toBe('test@example.com');
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          username: 'testuser',
          role: 'user',
        },
      },
    });
  });

  it('应该处理注册失败 - Supabase 错误', async () => {
    const mockError = {
      message: 'User already registered',
    };

    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({ data: null, error: mockError as any });

    const result = await register('testuser', 'test@example.com', 'password123');

    expect(result.success).toBe(false);
    expect(result.message).toBe('User already registered');
  });

  it('应该处理注册失败 - 无用户数据', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({ data: { user: null }, error: null });

    const result = await register('testuser', 'test@example.com', 'password123');

    expect(result.success).toBe(false);
    expect(result.message).toBe('注册失败，请重试');
  });

  it('应该处理注册异常', async () => {
    vi.mocked(supabase.auth.signUp).mockRejectedValueOnce(new Error('Network error'));

    const result = await register('testuser', 'test@example.com', 'password123');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Network error');
  });
});

describe('认证模块 - login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功通过邮箱登录', async () => {
    const mockAuthData = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    };

    const mockProfileData = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ data: mockAuthData, error: null });
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: mockProfileData, error: null }),
    } as any);

    const result = await login('test@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(result.user?.username).toBe('testuser');
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('应该成功通过用户名登录', async () => {
    const mockAuthData = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    };

    const mockProfileData = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    };

    // 邮箱登录失败
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ data: { user: null }, error: new Error('Invalid credentials') as any });
    
    // 通过用户名查找邮箱
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: { email: 'test@example.com' }, error: null }),
    } as any);

    // 用找到的邮箱登录
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ data: mockAuthData, error: null });
    
    // 获取用户信息
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: mockProfileData, error: null }),
    } as any);

    const result = await login('testuser', 'password123');

    expect(result.success).toBe(true);
    expect(result.user?.username).toBe('testuser');
  });

  it('应该处理登录失败 - 错误密码', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' } as any,
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: null, error: new Error('User not found') as any }),
    } as any);

    const result = await login('test@example.com', 'wrongpassword');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid login credentials');
  });

  it('应该处理登录失败 - 用户不存在', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: null,
      error: new Error('Invalid login credentials') as any,
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: null, error: new Error('User not found') as any }),
    } as any);

    const result = await login('nonexistent@example.com', 'password123');

    expect(result.success).toBe(false);
  });
});

describe('认证模块 - logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功登出', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

    const result = await logout();

    expect(result.success).toBe(true);
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('应该处理登出失败', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: { message: 'Sign out failed' } as any });

    const result = await logout();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Sign out failed');
  });
});

describe('认证模块 - getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该获取当前登录用户', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
    };

    const mockProfile = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    };

    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({ data: { user: mockUser }, error: null });
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: mockProfile, error: null }),
    } as any);

    const result = await getCurrentUser();

    expect(result).not.toBeNull();
    expect(result?.username).toBe('testuser');
  });

  it('应该返回 null 当用户未登录', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({ data: { user: null }, error: null });

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it('应该返回 null 当获取用户失败', async () => {
    vi.mocked(supabase.auth.getUser).mockRejectedValueOnce(new Error('Network error'));

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });
});

describe('认证模块 - isLoggedIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该返回 true 当用户已登录', async () => {
    const mockUser = { id: 'user-id', email: 'test@example.com' };
    
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({ data: { user: mockUser }, error: null });
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: { role: 'user' }, error: null }),
    } as any);

    const result = await isLoggedIn();

    expect(result).toBe(true);
  });

  it('应该返回 false 当用户未登录', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({ data: { user: null }, error: null });

    const result = await isLoggedIn();

    expect(result).toBe(false);
  });
});

describe('认证模块 - isAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该返回 true 当用户是管理员', async () => {
    const mockUser = { id: 'test-user-id', email: 'admin@example.com' };
    
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({ data: { user: mockUser }, error: null });
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: { role: 'admin' }, error: null }),
    } as any);

    const result = await isAdmin();

    expect(result).toBe(true);
  });

  it('应该返回 false 当用户不是管理员', async () => {
    const mockUser = { id: 'test-user-id', email: 'user@example.com' };
    
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({ data: { user: mockUser }, error: null });
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: { role: 'user' }, error: null }),
    } as any);

    const result = await isAdmin();

    expect(result).toBe(false);
  });

  it('应该返回 false 当获取用户失败', async () => {
    vi.mocked(supabase.auth.getUser).mockRejectedValueOnce(new Error('Network error'));

    const result = await isAdmin();

    expect(result).toBe(false);
  });
});
