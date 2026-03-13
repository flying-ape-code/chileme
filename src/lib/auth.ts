import { supabase } from './supabaseClient';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

// 注册
export const register = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    // 使用 Supabase Auth 注册用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role: 'user',
        },
      },
    });

    if (authError) {
      return { success: false, message: authError.message };
    }

    if (!authData.user) {
      return { success: false, message: '注册失败，请重试' };
    }

    // 自动触发器会在 profiles 表中创建记录
    // 等待触发器执行
    await new Promise(resolve => setTimeout(resolve, 500));

    // 获取用户信息
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return {
      success: true,
      user: profileData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '注册失败，请稍后重试',
    };
  }
};

// 登录（支持用户名或邮箱）
export const login = async (
  identifier: string, // 可以是用户名或邮箱
  password: string
): Promise<AuthResponse> => {
  try {
    // 先用邮箱尝试登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (!authError && authData.user) {
      // 邮箱登录成功，获取用户信息
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      return {
        success: true,
        user: profileData,
      };
    }

    // 如果邮箱登录失败，尝试用用户名登录
    // 先通过用户名查找邮箱
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', identifier)
      .single();

    if (profileError || !profileData) {
      return { success: false, message: '用户名或密码错误' };
    }

    // 使用找到的邮箱登录
    const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signInWithPassword({
      email: profileData.email,
      password,
    });

    if (retryAuthError) {
      return { success: false, message: '用户名或密码错误' };
    }

    // 获取完整用户信息
    const { data: fullProfileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', retryAuthData.user!.id)
      .single();

    return {
      success: true,
      user: fullProfileData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '登录失败，请稍后重试',
    };
  }
};

// 退出
export const logout = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '退出失败',
    };
  }
};

// 获取当前用户
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profileData || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// 检查是否已登录
export const isLoggedIn = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};

// 检查是否是管理员
export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === 'admin';
};
