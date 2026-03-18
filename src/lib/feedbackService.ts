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

// 上传图片到 Supabase Storage
export const uploadImageToStorage = async (
  file: File,
  feedbackId: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  try {
    // 生成唯一的文件名
    const fileExt = file.name.split('.').pop();
    const fileName = `${feedbackId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('feedback-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // 获取公开访问 URL
    const { data: urlData } = supabase.storage
      .from('feedback-images')
      .getPublicUrl(fileName);

    return { success: true, imageUrl: urlData.publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 批量上传图片
export const uploadFeedbackImages = async (
  feedbackId: string,
  files: File[]
): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> => {
  try {
    const uploadPromises = files.map(file => uploadImageToStorage(file, feedbackId));
    const results = await Promise.all(uploadPromises);
    
    // 检查是否有失败的上传
    const failed = results.find(r => !r.success);
    if (failed) {
      return { success: false, error: failed.error };
    }

    const imageUrls = results.map(r => r.imageUrl!).filter(Boolean);
    return { success: true, imageUrls };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 保存图片记录到数据库
export const saveFeedbackImages = async (
  feedbackId: string,
  imageUrls: string[],
  files: File[]
): Promise<{ success: boolean; data?: FeedbackImage[]; error?: string }> => {
  try {
    const images = imageUrls.map((url, index) => ({
      feedback_id: feedbackId,
      image_url: url,
      file_name: files[index]?.name,
      file_size: files[index]?.size
    }));

    const { data, error } = await supabase
      .from('feedback_images')
      .insert(images)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 上传图片并保存记录
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
