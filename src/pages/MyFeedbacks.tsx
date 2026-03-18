import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyFeedbacks, type Feedback } from '../lib/feedbackService';
import FeedbackForm from '../components/Feedback/FeedbackForm';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500',
  resolved: 'bg-green-500/20 text-green-400 border-green-500',
  rejected: 'bg-red-500/20 text-red-400 border-red-500'
};

const typeEmojis = {
  suggestion: '💡',
  complaint: '⚠️',
  other: '📝'
};

export default function MyFeedbacks() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadFeedbacks();
  }, [isAuthenticated, navigate]);

  const loadFeedbacks = async () => {
    setIsLoading(true);
    try {
      const data = await getMyFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error('加载反馈失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showForm) {
    return <FeedbackForm onSuccess={loadFeedbacks} onClose={() => setShowForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">我的反馈</h1>
            <p className="text-gray-400">查看和管理您的反馈记录</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-bold"
          >
            + 提交反馈
          </button>
        </div>

        {/* 反馈列表 */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-2xl mb-4">📭</p>
            <p>还没有反馈记录</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-cyan-400 hover:underline"
            >
              提交第一个反馈
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeEmojis[feedback.type]}</span>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-mono border ${statusColors[feedback.status]}`}>
                        {feedback.status === 'pending' && '待处理'}
                        {feedback.status === 'processing' && '处理中'}
                        {feedback.status === 'resolved' && '已解决'}
                        {feedback.status === 'rejected' && '已拒绝'}
                      </span>
                      <span className="text-gray-400 text-xs ml-2">
                        {new Date(feedback.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">
                    优先级：{feedback.priority === 'high' ? '🔴 高' : feedback.priority === 'medium' ? '🟡 中' : '🟢 低'}
                  </span>
                </div>

                <p className="text-white mb-4 whitespace-pre-wrap">{feedback.content}</p>

                {feedback.contact && (
                  <p className="text-gray-400 text-sm mb-4">
                    联系方式：{feedback.contact}
                  </p>
                )}

                {feedback.admin_reply && (
                  <div className="bg-gray-700/50 rounded p-4 mt-4">
                    <p className="text-cyan-400 text-sm font-bold mb-2">👨‍💼 管理员回复</p>
                    <p className="text-gray-300">{feedback.admin_reply}</p>
                    {feedback.replied_at && (
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(feedback.replied_at).toLocaleString('zh-CN')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
