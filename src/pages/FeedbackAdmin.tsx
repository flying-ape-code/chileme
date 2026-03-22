import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllFeedbacks, updateFeedback, type Feedback } from '../lib/feedbackService';

const statusOptions = [
  { value: 'pending', label: '待处理', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'processing', label: '处理中', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'resolved', label: '已解决', color: 'bg-green-500/20 text-green-400' },
  { value: 'rejected', label: '已拒绝', color: 'bg-red-500/20 text-red-400' }
];

const priorityOptions = [
  { value: 'high', label: '高优先级', icon: '🔴' },
  { value: 'medium', label: '中优先级', icon: '🟡' },
  { value: 'low', label: '低优先级', icon: '🟢' }
];

const typeEmojis = {
  suggestion: '💡',
  complaint: '⚠️',
  other: '📝'
};

export default function FeedbackAdmin() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Optimized: Only load when user/isAdmin changes, not on every filter change
  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    loadFeedbacks();
  }, [user, isAdmin, navigate]);

  // Optimized: Load feedbacks with filters as parameters, not dependencies
  const loadFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (filterStatus !== 'all') filters.status = filterStatus;
      if (filterType !== 'all') filters.type = filterType;
      
      const data = await getAllFeedbacks(filters);
      setFeedbacks(data);
    } catch (error) {
      console.error('加载反馈失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterType]);

  // Reload when filters change
  useEffect(() => {
    if (user && isAdmin) {
      loadFeedbacks();
    }
  }, [loadFeedbacks, user, isAdmin]);

  const handleReply = useCallback(async () => {
    if (!selectedFeedback || !replyText.trim()) return;

    setIsReplying(true);
    try {
      const result = await updateFeedback(selectedFeedback.id, {
        admin_reply: replyText,
        status: 'processing',
        replied_at: new Date().toISOString(),
        replied_by: user!.id
      });

      if (result.success) {
        setToast({ message: '回复成功！', type: 'success' });
        setReplyText('');
        setSelectedFeedback(null);
        loadFeedbacks();
      } else {
        setToast({ message: '回复失败：' + result.error, type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: '回复失败：' + error.message, type: 'error' });
    } finally {
      setIsReplying(false);
    }
  }, [selectedFeedback, replyText, user, loadFeedbacks]);

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    try {
      const result = await updateFeedback(id, { status: newStatus as any });
      if (result.success) {
        setToast({ message: '状态已更新', type: 'success' });
        loadFeedbacks();
      } else {
        setToast({ message: '更新失败：' + result.error, type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: '更新失败：' + error.message, type: 'error' });
    }
  }, [loadFeedbacks]);

  const handleCloseDialog = useCallback(() => {
    setReplyText('');
    setSelectedFeedback(null);
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Optimized: Use useMemo for filtered data to avoid recalculation on every render
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      if (filterStatus !== 'all' && f.status !== filterStatus) return false;
      if (filterType !== 'all' && f.type !== filterType) return false;
      return true;
    });
  }, [feedbacks, filterStatus, filterType]);

  // Optimized: Use useMemo for stats calculation
  const stats = useMemo(() => ({
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    processing: feedbacks.filter(f => f.status === 'processing').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length
  }), [feedbacks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">📋 反馈管理</h1>
            <p className="text-gray-400">管理用户反馈和回复</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            ← 返回管理后台
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">总反馈数</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-yellow-500/50">
            <p className="text-yellow-400 text-sm">待处理</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-blue-500/50">
            <p className="text-blue-400 text-sm">处理中</p>
            <p className="text-3xl font-bold text-blue-400">{stats.processing}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-green-500/50">
            <p className="text-green-400 text-sm">已解决</p>
            <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">状态筛选</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
              >
                <option value="all">全部</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="resolved">已解决</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">类型筛选</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
              >
                <option value="all">全部</option>
                <option value="suggestion">💡 建议</option>
                <option value="complaint">⚠️ 投诉</option>
                <option value="other">📝 其他</option>
              </select>
            </div>
          </div>
        </div>

        {/* 反馈列表 */}
        {isLoading ? (
          <div className="space-y-4">
            {/* Skeleton loading state */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div>
                      <div className="w-20 h-6 bg-gray-700 rounded-full mb-2"></div>
                      <div className="w-32 h-4 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="w-24 h-8 bg-gray-700 rounded"></div>
                </div>
                <div className="w-full h-16 bg-gray-700 rounded mb-4"></div>
                <div className="w-32 h-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">暂无反馈</div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeEmojis[feedback.type]}</span>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-mono ${
                        statusOptions.find(s => s.value === feedback.status)?.color
                      }`}>
                        {statusOptions.find(s => s.value === feedback.status)?.label}
                      </span>
                      <span className="text-gray-400 text-xs ml-2">
                        {new Date(feedback.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">
                      {priorityOptions.find(p => p.value === feedback.priority)?.icon}
                      {priorityOptions.find(p => p.value === feedback.priority)?.label}
                    </span>
                    <select
                      value={feedback.status}
                      onChange={(e) => handleStatusChange(feedback.id, e.target.value)}
                      className="px-2 py-1 bg-gray-700 text-white text-xs border border-gray-600 rounded"
                    >
                      {statusOptions.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-white mb-4 whitespace-pre-wrap">{feedback.content}</p>

                {feedback.contact && (
                  <p className="text-gray-400 text-sm mb-4">
                    联系方式：{feedback.contact}
                  </p>
                )}

                {feedback.admin_reply ? (
                  <div className="bg-gray-700/50 rounded p-4 mt-4">
                    <p className="text-cyan-400 text-sm font-bold mb-2">👨💼 已回复</p>
                    <p className="text-gray-300">{feedback.admin_reply}</p>
                    {feedback.replied_at && (
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(feedback.replied_at).toLocaleString('zh-CN')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <button
                      onClick={() => setSelectedFeedback(feedback)}
                      className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 text-sm"
                    >
                      回复此反馈
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Toast 提示 */}
        {toast && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[100] animate-fade-in ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.message}
          </div>
        )}

        {/* 回复模态框 */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full m-4">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">回复反馈</h3>
              
              <div className="bg-gray-700/50 rounded p-4 mb-4">
                <p className="text-gray-300 mb-2">{selectedFeedback.content}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(selectedFeedback.created_at).toLocaleString('zh-CN')}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">回复内容</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded min-h-[150px]"
                  placeholder="输入回复内容..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || isReplying}
                  className={`flex-1 py-3 rounded font-bold flex items-center justify-center gap-2 ${
                    replyText.trim() && !isReplying
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isReplying ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      发送中...
                    </>
                  ) : (
                    '发送回复'
                  )}
                </button>
                <button
                  onClick={handleCloseDialog}
                  disabled={isReplying}
                  className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
