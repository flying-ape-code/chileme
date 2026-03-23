import React, { useState, useEffect } from 'react';
import {
  getUserHistory,
  deleteHistoryRecord,
  clearAllHistory,
  getHistoryStats,
  getHistoryLocal,
  deleteHistoryLocal,
  clearHistoryLocal,
  type HistoryRecord
} from '../lib/historyService';

interface HistoryPageProps {
  userId?: string;
}

export default function HistoryPage({ userId }: HistoryPageProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [stats, setStats] = useState<{
    totalCount: number;
    thisWeekCount: number;
    categoryStats: Array<{ category: string; count: number; percentage: number }>;
  } | null>(null);

  const isLocal = !userId;

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    setIsLoading(true);
    
    if (userId) {
      // 从数据库加载
      const [historyData, statsData] = await Promise.all([
        getUserHistory(userId, { limit: 100 }),
        getHistoryStats(userId)
      ]);
      setHistory(historyData);
      if (statsData) {
        setStats({
          totalCount: statsData.totalCount,
          thisWeekCount: statsData.thisWeekCount,
          categoryStats: statsData.categoryStats
        });
      }
    } else {
      // 从本地存储加载
      const localHistory = getHistoryLocal(100);
      setHistory(localHistory);
      setStats({
        totalCount: localHistory.length,
        thisWeekCount: localHistory.filter(
          r => new Date(r.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        categoryStats: []
      });
    }
    
    setIsLoading(false);
  };

  const handleDelete = async (recordId: string) => {
    if (userId) {
      const result = await deleteHistoryRecord(recordId, userId);
      if (result.success) {
        setHistory(history.filter(r => r.id !== recordId));
        setShowDeleteConfirm(null);
      } else {
        alert('删除失败：' + result.error);
      }
    } else {
      deleteHistoryLocal(recordId);
      setHistory(history.filter(r => r.id !== recordId));
      setShowDeleteConfirm(null);
    }
  };

  const handleClearAll = async () => {
    if (userId) {
      const result = await clearAllHistory(userId);
      if (result.success) {
        setHistory([]);
        setShowClearConfirm(false);
      } else {
        alert('清空失败：' + result.error);
      }
    } else {
      clearHistoryLocal();
      setHistory([]);
      setShowClearConfirm(false);
    }
  };

  const getCategoryEmoji = (category?: string) => {
    switch (category) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🍜';
      case 'afternoon-tea': return '☕';
      case 'dinner': return '🍽️';
      case 'night-snack': return '🌙';
      default: return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (days === 0) {
      return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="history-page min-h-screen bg-gradient-to-b from-cyber-purple to-cyber-blue text-white p-4">
        <div className="max-w-2xl mx-auto pt-20 text-center">
          <div className="text-gray-400">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page min-h-screen bg-gradient-to-b from-cyber-purple to-cyber-blue text-white p-4">
      <div className="max-w-2xl mx-auto pt-16 pb-24">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">📜 历史记录</h1>
          {history.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              清空全部
            </button>
          )}
        </div>

        {/* 统计信息 */}
        {stats && stats.totalCount > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.totalCount}</div>
              <div className="text-sm text-gray-300">总选择次数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.thisWeekCount}</div>
              <div className="text-sm text-gray-300">本周选择</div>
            </div>
          </div>
        )}

        {/* 分类统计图表 */}
        {stats && stats.categoryStats && stats.categoryStats.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold mb-4">📊 分类偏好</h3>
            <div className="space-y-3">
              {stats.categoryStats.slice(0, 5).map(cat => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {getCategoryEmoji(cat.category)}
                      <span className="capitalize">{cat.category}</span>
                    </span>
                    <span>{cat.percentage}% ({cat.count}次)</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyber-cyan to-cyber-pink h-2 rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 历史记录列表 */}
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="text-6xl mb-4">🍽️</div>
              <div className="text-xl font-bold mb-2">暂无历史记录</div>
              <div className="text-gray-300">开始使用"吃了么"来记录你的美食选择吧！</div>
            </div>
          ) : (
            history.map(record => (
              <div
                key={record.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:bg-white/15"
              >
                {/* 商品图片 */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                  {record.productImage ? (
                    <img
                      src={record.productImage}
                      alt={record.productName || '商品'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=美食';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {getCategoryEmoji(record.category)}
                    </div>
                  )}
                </div>

                {/* 商品信息 */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{record.productName || '未知商品'}</div>
                  <div className="text-sm text-gray-300 flex items-center gap-2">
                    <span>{getCategoryEmoji(record.category)} {record.category}</span>
                    <span>•</span>
                    <span>{formatDate(record.createdAt)}</span>
                  </div>
                </div>

                {/* 删除按钮 */}
                {showDeleteConfirm === record.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm font-bold hover:bg-gray-600 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(record.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="删除记录"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 清空确认弹窗 */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-2">确认清空历史记录？</h3>
              <p className="text-gray-600 mb-6">
                此操作不可恢复，将删除所有{history.length}条历史记录。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClearAll}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  确认清空
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
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
