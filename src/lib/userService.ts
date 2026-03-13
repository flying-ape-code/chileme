import { supabase } from './supabaseClient';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  user?: User;
  users?: User[];
}

// 获取所有用户（仅管理员）
export const getAllUsers = async (): Promise<UserResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, users: data || [] };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取用户列表失败',
    };
  }
};

// 根据 ID 获取用户
export const getUserById = async (userId: string): Promise<UserResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, user: data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取用户信息失败',
    };
  }
};

// 更新用户角色（仅管理员）
export const updateUserRole = async (
  userId: string,
  role: 'user' | 'admin'
): Promise<UserResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, user: data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '更新用户角色失败',
    };
  }
};

// 更新用户信息
export const updateUser = async (
  userId: string,
  userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
): Promise<UserResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, user: data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '更新用户信息失败',
    };
  }
};

// 删除用户（仅管理员）
export const deleteUser = async (userId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // 先删除关联的 spin_records 和 history
    await supabase.from('spin_records').delete().eq('user_id', userId);
    await supabase.from('history').delete().eq('user_id', userId);

    // 删除用户（会级联删除 profiles）
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '删除用户失败',
    };
  }
};

// 获取用户统计信息
export const getUserStats = async (): Promise<{ total: number; admins: number; users: number } | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role');

    if (error) {
      return null;
    }

    const total = data?.length || 0;
    const admins = data?.filter(u => u.role === 'admin').length || 0;
    const users = total - admins;

    return { total, admins, users };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};
