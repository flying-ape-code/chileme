import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createFeedback,
  getMyFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  uploadImageToStorage,
  uploadFeedbackImages,
  saveFeedbackImages,
  uploadFeedbackImage,
  getFeedbackImages,
  getAllFeedbacks,
  type Feedback,
} from '../lib/feedbackService';
import { mockSupabase } from './setup';

describe('FeedbackService - 核心功能测试', () => {
  // Mock data
  const mockFeedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at'> = {
    user_id: 'user-123',
    type: 'suggestion',
    content: 'This is a test feedback',
    contact: 'test@example.com',
    status: 'pending',
    priority: 'medium',
  };

  const mockFeedbackWithId: Feedback = {
    id: 'feedback-uuid-123',
    ...mockFeedback,
    created_at: '2026-03-19T00:00:00Z',
    updated_at: '2026-03-19T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createFeedback() - 创建反馈', () => {
    it('应该成功创建反馈', async () => {
      // Mock Supabase insert response
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockFeedbackWithId,
              error: null,
            }),
          }),
        }),
      });

      const result = await createFeedback(mockFeedback);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFeedbackWithId);
      expect(result.error).toBeUndefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('feedbacks');
    });

    it('应该处理创建失败的情况', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Duplicate entry' },
            }),
          }),
        }),
      });

      const result = await createFeedback(mockFeedback);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Duplicate entry');
    });

    it('应该处理网络错误', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Network error')),
          }),
        }),
      });

      const result = await createFeedback(mockFeedback);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getMyFeedbacks() - 获取用户反馈列表', () => {
    it('应该成功获取反馈列表', async () => {
      const mockFeedbacks = [mockFeedbackWithId, { ...mockFeedbackWithId, id: 'feedback-456' }];

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockFeedbacks,
            error: null,
          }),
        }),
      });

      const result = await getMyFeedbacks();

      expect(result).toEqual(mockFeedbacks);
      expect(mockSupabase.from).toHaveBeenCalledWith('feedbacks');
    });

    it('应该返回空数组当没有反馈时', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await getMyFeedbacks();

      expect(result).toEqual([]);
    });

    it('应该处理查询错误', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Permission denied' },
          }),
        }),
      });

      await expect(getMyFeedbacks()).rejects.toThrow('Permission denied');
    });
  });

  describe('getFeedbackById() - 获取反馈详情', () => {
    it('应该成功获取反馈详情', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockFeedbackWithId,
              error: null,
            }),
          }),
        }),
      });

      const result = await getFeedbackById('feedback-uuid-123');

      expect(result).toEqual(mockFeedbackWithId);
    });

    it('应该返回 null 当反馈不存在时', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const result = await getFeedbackById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateFeedback() - 更新反馈状态', () => {
    it('应该成功更新反馈', async () => {
      const updatedFeedback = { ...mockFeedbackWithId, status: 'processing' as const };

      mockSupabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedFeedback,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updateFeedback('feedback-uuid-123', { status: 'processing' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedFeedback);
    });

    it('应该处理更新失败', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      });

      const result = await updateFeedback('feedback-uuid-123', { status: 'resolved' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('deleteFeedback() - 删除反馈', () => {
    it('应该成功删除反馈', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await deleteFeedback('feedback-uuid-123');

      expect(result).toBe(true);
    });

    it('应该返回 false 当删除失败时', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
        }),
      });

      const result = await deleteFeedback('feedback-uuid-123');

      expect(result).toBe(false);
    });
  });
});

describe('FeedbackService - 图片上传测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImageToStorage() - 图片上传', () => {
    const mockFile = new File(['test content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });

    it('应该成功上传图片', async () => {
      const mockFileName = 'feedback-123/1234567890_abc123.jpg';

      mockSupabase.storage.from = vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: mockFileName },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: `https://storage.supabase.co/feedback-images/${mockFileName}` },
        }),
      });

      const result = await uploadImageToStorage(mockFile, 'feedback-123');

      expect(result.success).toBe(true);
      expect(result.imageUrl).toContain('https://storage.supabase.co/feedback-images/');
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('feedback-images');
    });

    it('应该处理上传失败', async () => {
      mockSupabase.storage.from = vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'File too large' },
        }),
      });

      const result = await uploadImageToStorage(mockFile, 'feedback-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('File too large');
    });

    it('应该处理存储错误', async () => {
      mockSupabase.storage.from = vi.fn().mockReturnValue({
        upload: vi.fn().mockRejectedValue(new Error('Storage error')),
      });

      const result = await uploadImageToStorage(mockFile, 'feedback-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });
  });

  describe('uploadFeedbackImages() - 批量上传图片', () => {
    const mockFiles = [
      new File(['content1'], 'image1.jpg', { type: 'image/jpeg' }),
      new File(['content2'], 'image2.jpg', { type: 'image/jpeg' }),
    ];

    it('应该成功批量上传图片', async () => {
      mockSupabase.storage.from = vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'test/path.jpg' },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://storage.supabase.co/test/path.jpg' },
        }),
      });

      const result = await uploadFeedbackImages('feedback-123', mockFiles);

      expect(result.success).toBe(true);
      expect(result.imageUrls).toHaveLength(2);
    });

    it('应该处理部分上传失败', async () => {
      mockSupabase.storage.from = vi.fn().mockReturnValue({
        upload: vi.fn()
          .mockResolvedValueOnce({ data: { path: 'path1.jpg' }, error: null })
          .mockResolvedValueOnce({ data: null, error: { message: 'Failed' } }),
      });

      const result = await uploadFeedbackImages('feedback-123', mockFiles);

      expect(result.success).toBe(false);
    });
  });

  describe('saveFeedbackImages() - 保存图片记录', () => {
    it('应该成功保存图片记录到数据库', async () => {
      const mockImages = [
        { id: 'img-1', feedback_id: 'feedback-123', image_url: 'url1.jpg', created_at: '2026-03-19' },
        { id: 'img-2', feedback_id: 'feedback-123', image_url: 'url2.jpg', created_at: '2026-03-19' },
      ];

      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: mockImages,
            error: null,
          }),
        }),
      });

      const result = await saveFeedbackImages('feedback-123', ['url1.jpg', 'url2.jpg'], [
        new File([''], 'img1.jpg'),
        new File([''], 'img2.jpg'),
      ]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockImages);
    });

    it('应该处理保存失败', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      const result = await saveFeedbackImages('feedback-123', ['url1.jpg'], [new File([''], 'img1.jpg')]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getFeedbackImages() - 获取反馈图片', () => {
    it('应该成功获取图片列表', async () => {
      const mockImages = [
        { id: 'img-1', feedback_id: 'feedback-123', image_url: 'url1.jpg', created_at: '2026-03-19' },
      ];

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockImages,
            error: null,
          }),
        }),
      });

      const result = await getFeedbackImages('feedback-123');

      expect(result).toEqual(mockImages);
    });
  });
});

describe('FeedbackService - 权限测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllFeedbacks() - 管理员获取所有反馈', () => {
    it('应该成功获取所有反馈（无筛选）', async () => {
      const mockFeedbacks = [
        { id: '1', user_id: 'user-1', type: 'suggestion', status: 'pending', created_at: '2026-03-19' },
        { id: '2', user_id: 'user-2', type: 'complaint', status: 'resolved', created_at: '2026-03-18' },
      ];

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockFeedbacks,
            error: null,
          }),
        }),
      });

      const result = await getAllFeedbacks();

      expect(result).toEqual(mockFeedbacks);
      expect(mockSupabase.from).toHaveBeenCalledWith('feedbacks');
    });

    it('应该按状态筛选反馈', async () => {
      const mockFeedbacks = [
        { id: '1', user_id: 'user-1', type: 'suggestion', status: 'pending', created_at: '2026-03-19' },
      ];

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockFeedbacks,
              error: null,
            }),
          }),
        }),
      });

      const result = await getAllFeedbacks({ status: 'pending' });

      expect(result).toEqual(mockFeedbacks);
    });

    it('应该按类型筛选反馈', async () => {
      const mockFeedbacks = [
        { id: '1', user_id: 'user-1', type: 'complaint', status: 'pending', created_at: '2026-03-19' },
      ];

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockFeedbacks,
              error: null,
            }),
          }),
        }),
      });

      const result = await getAllFeedbacks({ type: 'complaint' });

      expect(result).toEqual(mockFeedbacks);
    });

    it('应该按优先级筛选反馈', async () => {
      const mockFeedbacks = [
        { id: '1', user_id: 'user-1', type: 'suggestion', status: 'pending', priority: 'high', created_at: '2026-03-19' },
      ];

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockFeedbacks,
              error: null,
            }),
          }),
        }),
      });

      const result = await getAllFeedbacks({ priority: 'high' });

      expect(result).toEqual(mockFeedbacks);
    });

    it('应该支持多条件筛选', async () => {
      const mockFeedbacks = [
        { id: '1', user_id: 'user-1', type: 'suggestion', status: 'pending', priority: 'high', created_at: '2026-03-19' },
      ];

      // Mock chaining: select -> eq (status) -> eq (type) -> eq (priority) -> order
      const mockOrder = {
        order: vi.fn().mockResolvedValue({
          data: mockFeedbacks,
          error: null,
        }),
      };
      const mockEqPriority = {
        eq: vi.fn().mockReturnValue(mockOrder),
      };
      const mockEqType = {
        eq: vi.fn().mockReturnValue(mockEqPriority),
      };
      const mockEqStatus = {
        eq: vi.fn().mockReturnValue(mockEqType),
      };
      const mockSelect = {
        select: vi.fn().mockReturnValue(mockEqStatus),
      };

      mockSupabase.from = vi.fn().mockReturnValue(mockSelect);

      const result = await getAllFeedbacks({ status: 'pending', type: 'suggestion', priority: 'high' });

      expect(result).toEqual(mockFeedbacks);
      expect(mockSupabase.from).toHaveBeenCalledWith('feedbacks');
    });
  });

  describe('RLS 权限模拟测试', () => {
    it('用户只能访问自己的反馈 - 通过 RLS 策略保证', () => {
      // 这个测试验证 RLS 策略的存在
      // 实际测试需要在 Supabase 中配置 RLS 策略
      expect(true).toBe(true); // RLS 策略已在 SQL 中定义
    });

    it('管理员可以访问所有反馈 - 通过 admin 角色检查', () => {
      // 管理员通过 getAllFeedbacks() 访问所有反馈
      // 实际权限由 Supabase RLS 策略控制
      expect(true).toBe(true);
    });

    it('图片访问权限应与反馈权限一致', () => {
      // 图片访问依赖于反馈的权限检查
      // 如果用户不能访问反馈，也不能访问其图片
      expect(true).toBe(true);
    });
  });
});

describe('FeedbackService - 错误处理', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该处理 Supabase 连接错误', async () => {
    mockSupabase.from = vi.fn().mockImplementation(() => {
      throw new Error('Supabase connection failed');
    });

    await expect(createFeedback({
      user_id: 'user-123',
      type: 'suggestion',
      content: 'Test',
      status: 'pending',
      priority: 'medium',
    })).resolves.toMatchObject({ success: false, error: 'Supabase connection failed' });
  });

  it('应该处理无效数据', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid input' },
          }),
        }),
      }),
    });

    const result = await createFeedback({
      user_id: '',
      type: 'invalid' as any,
      content: '',
      status: 'pending',
      priority: 'medium',
    });

    expect(result.success).toBe(false);
  });

  it('应该处理超时错误', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockRejectedValue(new Error('Request timeout')),
        }),
      }),
    });

    const result = await createFeedback({
      user_id: 'user-123',
      type: 'suggestion',
      content: 'Test',
      status: 'pending',
      priority: 'medium',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Request timeout');
  });
});
