import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createFeedback,
  getMyFeedbacks,
  getFeedbackById,
  updateFeedback,
  uploadFeedbackImage,
  getAllFeedbacks,
} from '../lib/feedbackService';
import { mockSupabase } from './setup';

/**
 * API 端点测试
 * 
 * 这些测试模拟了 REST API 端点的行为：
 * - POST /api/feedbacks → createFeedback()
 * - GET /api/feedbacks → getMyFeedbacks() / getAllFeedbacks()
 * - GET /api/feedbacks/:id → getFeedbackById()
 * - PATCH /api/feedbacks/:id → updateFeedback()
 * - POST /api/feedbacks/images → uploadFeedbackImage()
 */

describe('API 端点测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/feedbacks - 创建反馈', () => {
    const validPayload = {
      user_id: 'user-123',
      type: 'suggestion',
      content: 'I love this app!',
      contact: 'user@example.com',
      status: 'pending',
      priority: 'medium',
    };

    it('应该接受有效的反馈请求 (201 Created)', async () => {
      const mockResponse = {
        id: 'feedback-uuid',
        ...validPayload,
        created_at: '2026-03-19T00:00:00Z',
        updated_at: '2026-03-19T00:00:00Z',
      };

      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockResponse,
              error: null,
            }),
          }),
        }),
      });

      const result = await createFeedback(validPayload);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(validPayload);
      expect(result.data?.id).toBeDefined();
    });

    it('应该拒绝缺少必需字段的请求 (400 Bad Request)', async () => {
      const invalidPayload = {
        user_id: 'user-123',
        // missing type, content, status, priority
      };

      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'null value in column "type" violates not-null constraint' },
            }),
          }),
        }),
      });

      const result = await createFeedback(invalidPayload as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not-null constraint');
    });

    it('应该拒绝无效的反馈类型 (400 Bad Request)', async () => {
      const invalidPayload = {
        ...validPayload,
        type: 'invalid_type',
      };

      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'invalid input value for enum' },
            }),
          }),
        }),
      });

      const result = await createFeedback(invalidPayload);

      expect(result.success).toBe(false);
    });

    it('应该拒绝内容过短的反馈 (400 Bad Request)', async () => {
      const shortContent = {
        ...validPayload,
        content: 'Too short',
      };

      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'new row for relation "feedbacks" violates check constraint' },
            }),
          }),
        }),
      });

      const result = await createFeedback(shortContent);

      expect(result.success).toBe(false);
    });

    it('应该处理未授权访问 (401 Unauthorized)', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Invalid API key' },
            }),
          }),
        }),
      });

      const result = await createFeedback(validPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('应该处理服务器错误 (500 Internal Server Error)', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          }),
        }),
      });

      const result = await createFeedback(validPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('GET /api/feedbacks - 获取反馈列表', () => {
    it('应该返回用户的反馈列表 (200 OK)', async () => {
      const mockFeedbacks = [
        {
          id: 'feedback-1',
          user_id: 'user-123',
          type: 'suggestion',
          content: 'First feedback',
          status: 'pending',
          priority: 'medium',
          created_at: '2026-03-19T00:00:00Z',
          updated_at: '2026-03-19T00:00:00Z',
        },
        {
          id: 'feedback-2',
          user_id: 'user-123',
          type: 'complaint',
          content: 'Second feedback',
          status: 'resolved',
          priority: 'high',
          created_at: '2026-03-18T00:00:00Z',
          updated_at: '2026-03-18T00:00:00Z',
        },
      ];

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockFeedbacks,
            error: null,
          }),
        }),
      });

      const result = await getMyFeedbacks();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('feedback-1');
      expect(result[1].id).toBe('feedback-2');
    });

    it('应该返回空数组当用户没有反馈时 (200 OK)', async () => {
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

    it('应该按创建时间降序排序', async () => {
      const mockFeedbacks = [
        { created_at: '2026-03-19T00:00:00Z' },
        { created_at: '2026-03-18T00:00:00Z' },
        { created_at: '2026-03-17T00:00:00Z' },
      ];

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockFeedbacks,
            error: null,
          }),
        }),
      });

      const result = await getMyFeedbacks();

      expect(result[0].created_at).toBe('2026-03-19T00:00:00Z');
      expect(result[2].created_at).toBe('2026-03-17T00:00:00Z');
    });

    it('应该处理查询参数 - 管理员获取所有反馈', async () => {
      const mockAllFeedbacks = [
        { id: '1', user_id: 'user-1', type: 'suggestion' },
        { id: '2', user_id: 'user-2', type: 'complaint' },
      ];

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockAllFeedbacks,
            error: null,
          }),
        }),
      });

      const result = await getAllFeedbacks();

      expect(result).toHaveLength(2);
    });

    it('应该支持筛选参数 - status (200 OK)', async () => {
      const mockFiltered = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'pending' },
      ];

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockFiltered,
              error: null,
            }),
          }),
        }),
      });

      const result = await getAllFeedbacks({ status: 'pending' });

      expect(result).toHaveLength(2);
      expect(result.every((f: any) => f.status === 'pending')).toBe(true);
    });

    it('应该处理服务器错误 (500 Internal Server Error)', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      await expect(getMyFeedbacks()).rejects.toThrow('Database error');
    });
  });

  describe('GET /api/feedbacks/:id - 获取反馈详情', () => {
    it('应该返回单个反馈详情 (200 OK)', async () => {
      const mockFeedback = {
        id: 'feedback-uuid',
        user_id: 'user-123',
        type: 'suggestion',
        content: 'Detailed feedback content',
        status: 'processing',
        priority: 'high',
        admin_reply: 'Thank you for your feedback!',
        created_at: '2026-03-19T00:00:00Z',
        updated_at: '2026-03-19T00:00:00Z',
      };

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockFeedback,
              error: null,
            }),
          }),
        }),
      });

      const result = await getFeedbackById('feedback-uuid');

      expect(result).toEqual(mockFeedback);
    });

    it('应该返回 404 当反馈不存在时', async () => {
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

    it('应该返回 400 当 ID 格式无效时', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'invalid input syntax for type uuid' },
            }),
          }),
        }),
      });

      const result = await getFeedbackById('invalid-uuid');

      expect(result).toBeNull();
    });
  });

  describe('PATCH /api/feedbacks/:id - 更新反馈', () => {
    const updatePayload = {
      status: 'processing',
      priority: 'high',
      admin_reply: 'We are looking into this.',
    };

    it('应该成功更新反馈 (200 OK)', async () => {
      const updatedFeedback = {
        id: 'feedback-uuid',
        user_id: 'user-123',
        type: 'complaint',
        content: 'Original content',
        ...updatePayload,
        created_at: '2026-03-19T00:00:00Z',
        updated_at: '2026-03-19T01:00:00Z',
      };

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

      const result = await updateFeedback('feedback-uuid', updatePayload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedFeedback);
    });

    it('应该只更新提供的字段', async () => {
      const partialUpdate = { status: 'resolved' };

      mockSupabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'feedback-uuid', ...partialUpdate },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updateFeedback('feedback-uuid', partialUpdate);

      expect(result.success).toBe(true);
    });

    it('应该返回 404 当反馈不存在时', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      const result = await updateFeedback('non-existent-id', updatePayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    it('应该拒绝无效的状态值 (400 Bad Request)', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'invalid input value for enum' },
              }),
            }),
          }),
        }),
      });

      const result = await updateFeedback('feedback-uuid', { status: 'invalid_status' as any });

      expect(result.success).toBe(false);
    });

    it('应该处理未授权访问 (403 Forbidden)', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'new row violates row-level security policy' },
              }),
            }),
          }),
        }),
      });

      const result = await updateFeedback('feedback-uuid', updatePayload);

      expect(result.success).toBe(false);
      expect(result.error).toContain('row-level security');
    });
  });

  describe('POST /api/feedbacks/images - 上传图片', () => {
    it('应该成功上传图片并返回 URL (201 Created)', async () => {
      const mockImageUrl = 'https://storage.supabase.co/feedback-images/test-image.jpg';

      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'image-uuid',
                feedback_id: 'feedback-uuid',
                image_url: mockImageUrl,
                file_name: 'test-image.jpg',
                file_size: 102400,
                created_at: '2026-03-19T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await uploadFeedbackImage(
        'feedback-uuid',
        mockImageUrl,
        'test-image.jpg',
        102400
      );

      expect(result.success).toBe(true);
      expect(result.data?.image_url).toBe(mockImageUrl);
      expect(result.data?.feedback_id).toBe('feedback-uuid');
    });

    it('应该返回 400 当反馈 ID 不存在时', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'insert or update on table "feedback_images" violates foreign key' },
            }),
          }),
        }),
      });

      const result = await uploadFeedbackImage(
        'non-existent-feedback',
        'https://example.com/image.jpg',
        'image.jpg',
        1024
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('foreign key');
    });

    it('应该处理无效的图片 URL (400 Bad Request)', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'invalid URL format' },
            }),
          }),
        }),
      });

      const result = await uploadFeedbackImage(
        'feedback-uuid',
        'not-a-valid-url',
        'image.jpg',
        1024
      );

      expect(result.success).toBe(false);
    });

    it('应该处理服务器错误 (500 Internal Server Error)', async () => {
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Storage service unavailable')),
          }),
        }),
      });

      const result = await uploadFeedbackImage(
        'feedback-uuid',
        'https://example.com/image.jpg',
        'image.jpg',
        1024
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage service unavailable');
    });
  });
});
