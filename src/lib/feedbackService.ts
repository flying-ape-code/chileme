import { supabase } from './supabaseClient';

export interface Feedback {
  id: string;
  user_id: string;
  type: 'suggestion' | 'complaint' | 'other';
  content: string;
  contact?: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  admin_reply?: string;
  replied_at?: string;
  replied_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackImage {
  id: string;
  feedback_id: string;
  image_url: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
}

// 创建反馈
export const createFeedback = async (
  feedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: Feedback; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .insert([feedback])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 获取我的反馈列表
export const getMyFeedbacks = async (): Promise<Feedback[]> => {
  const { data, error } = await supabase
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// 获取反馈详情
export const getFeedbackById = async (id: string): Promise<Feedback | null> => {
  const { data, error } = await supabase
    .from('feedbacks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
};

// 更新反馈（管理员）
export const updateFeedback = async (
  id: string,
  updates: Partial<Feedback>
): Promise<{ success: boolean; data?: Feedback; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 删除反馈
export const deleteFeedback = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('feedbacks').delete().eq('id', id);
  return !error;
};

// 上传图片
export const uploadFeedbackImage = async (
  feedbackId: string,
  imageUrl: string,
  fileName?: string,
  fileSize?: number
): Promise<{ success: boolean; data?: FeedbackImage; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('feedback_images')
      .insert([{
        feedback_id: feedbackId,
        image_url: imageUrl,
        file_name: fileName,
        file_size: fileSize
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 获取反馈的图片
export const getFeedbackImages = async (feedbackId: string): Promise<FeedbackImage[]> => {
  const { data, error } = await supabase
    .from('feedback_images')
    .select('*')
    .eq('feedback_id', feedbackId);

  if (error) throw error;
  return data || [];
};

// 管理员获取所有反馈（带筛选）
export const getAllFeedbacks = async (filters?: {
  status?: string;
  type?: string;
  priority?: string;
}): Promise<Feedback[]> => {
  let query = supabase.from('feedbacks').select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};
