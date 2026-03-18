import React, { useState } from 'react';
import { createFeedback, uploadFeedbackImage } from '../../lib/feedbackService';
import { useAuth } from '../../context/AuthContext';

interface FeedbackFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function FeedbackForm({ onSuccess, onClose }: FeedbackFormProps) {
  const { user } = useAuth();
  const [type, setType] = useState<'suggestion' | 'complaint' | 'other'>('suggestion');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!content.trim()) {
      setError('请填写反馈内容');
      return;
    }

    if (!user) {
      setError('请先登录');
      return;
    }

    setIsSubmitting(true);

    try {
      // 创建反馈
      const result = await createFeedback({
        user_id: user.id,
        type,
        content,
        contact: contact || undefined,
        status: 'pending',
        priority: 'medium'
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || '创建失败');
      }

      // 上传图片（如果有）
      if (images.length > 0) {
        // TODO: 实现图片上传到 Supabase Storage
        console.log('图片上传功能待实现', images);
      }

      // 成功
      alert('反馈提交成功！');
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      setError(err.message || '提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 border border-cyan-500/50">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">用户反馈</h1>
        <p className="text-gray-400 mb-6">帮助我们改进产品</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 反馈类型 */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              反馈类型
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="suggestion"
                  checked={type === 'suggestion'}
                  onChange={(e) => setType(e.target.value as any)}
                  className="text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-white">💡 建议</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="complaint"
                  checked={type === 'complaint'}
                  onChange={(e) => setType(e.target.value as any)}
                  className="text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-white">⚠️ 投诉</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="other"
                  checked={type === 'other'}
                  onChange={(e) => setType(e.target.value as any)}
                  className="text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-white">📝 其他</span>
              </label>
            </div>
          </div>

          {/* 反馈内容 */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              反馈内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-cyan-500 min-h-[200px]"
              placeholder="请详细描述您的问题或建议..."
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 联系方式 */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              联系方式（可选）
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-cyan-500"
              placeholder="微信/邮箱/手机号，方便我们回复您"
              disabled={isSubmitting}
            />
          </div>

          {/* 图片上传 */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              上传图片（可选）
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-cyan-500"
              disabled={isSubmitting}
            />
            {images.length > 0 && (
              <p className="text-gray-400 text-sm mt-2">
                已选择 {images.length} 张图片
              </p>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 font-bold py-3 rounded transition-colors ${
                isSubmitting
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-500 text-white hover:bg-cyan-600'
              }`}
            >
              {isSubmitting ? '提交中...' : '提交反馈'}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
