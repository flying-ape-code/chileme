import React, { useState, useEffect } from 'react';
import {
  getUserSpinHistory,
  deleteSpinHistoryRecord,
  clearAllSpinHistory,
  getSpinHistoryStats,
  SpinHistoryRecord,
  SpinHistoryStats,
} from '../lib/spinHistoryService';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface HistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

function History({ isOpen, onClose }: HistoryProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<SpinHistoryRecord[]>([]);
  const [stats, setStats] = useState<SpinHistoryStats | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadData = async () => {
    if (!user || !isOpen) return;

    setLoading(true);
    try {
      const [historyRes, statsRes] = await Promise.all([
        getUserSpinHistory(user.id, 50),
        getSpinHistoryStats(user.id),
      ]);

      if (historyRes.success && historyRes.records) {
        setHistory(historyRes.records);
      }

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (error) {
      console.error('加载历史数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('确定要删除这条历史记录吗？')) return;

    setDeleting(recordId);
    try {
      const result = await deleteSpinHistoryRecord(recordId);
      if (result.success) {
        setHistory(history.filter((h) => h.id !== recordId));
        // 重新加载统计
        if (user) {
          const statsRes = await getSpinHistoryStats(user.id);
          if (statsRes.success && statsRes.stats) {
            setStats(statsRes.stats);
          }
        }
      } else {
        alert('删除失败：' + result.message);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清空所有历史记录吗？此操作不可恢复！')) return;

    if (!user) return;

    setLoading(true);
    try {
      const result = await clearAllSpinHistory(user.id);
      if (result.success) {
        setHistory([]);
        setStats(null);
      } else {
        alert('清空失败：' + result.message);
      }
    } catch (error) {
      console.error('清空失败:', error);
      alert('清空失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // 准备图表数据
  const weeklyChartData = stats?.weeklyData.map((day) => ({
    name: day.date,
    count: day.count,
  }));

  const categoryPieData = stats
    ? Object.entries(stats.categoryBreakdown).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const topFoodsData = stats
    ? Object.entries(stats.mostFrequent)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    : [];

  if (!user) {
    return (
      <div
        className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900 border-2 border-cyan-400 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">
            🔒 请先登录
          </h2>
          <p className="text-gray-400 mb-6">
            历史记录功能需要登录才能使用
          </p>
          <button
            onClick={onClose}
            className="bg-cyan-500 text-black px-6 py-2 rounded font-bold hover:bg-cyan-400 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-gray-900 border-2 border-cyan-400 rounded-lg w-[95%] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/50">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-cyan-400">
              📜 历史记录
            </h2>
            <span className="text-sm text-gray-400">
              {history.length} 次选择
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📋 列表
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'stats'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📊 统计
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-2xl mb-2">⏳</div>
              <p>加载中...</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-800 p-4 rounded border border-gray-700 hover:border-cyan-400 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{entry.category_emoji}</span>
                        <span className="text-sm text-gray-300">
                          {entry.category}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      <div className="text-cyan-400 font-mono text-sm mb-1">
                        🎯 结果：{entry.winner_emoji} {entry.winner}
                      </div>
                      <div className="text-xs text-gray-400">
                        候选：{entry.items.join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRecord(entry.id)}
                      disabled={deleting === entry.id}
                      className="ml-3 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="删除这条记录"
                    >
                      {deleting === entry.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>暂无历史记录</p>
                  <p className="text-sm">开始你的第一次选择吧！</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* 概览统计 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">总选择次数</div>
                  <div className="text-3xl font-bold text-cyan-400">
                    {stats?.totalSpins || 0}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">本周选择</div>
                  <div className="text-3xl font-bold text-green-400">
                    {stats?.thisWeekSpins || 0}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">今日选择</div>
                  <div className="text-3xl font-bold text-purple-400">
                    {stats?.todaySpins || 0}
                  </div>
                </div>
              </div>

              {/* 本周趋势图表 */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">
                  📈 本周选择趋势
                </h3>
                {weeklyChartData && weeklyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    暂无本周数据
                  </div>
                )}
              </div>

              {/* 最常选食物 */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">
                  🏆 最常选食物 TOP 5
                </h3>
                {topFoodsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topFoodsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#9ca3af"
                        fontSize={12}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    暂无数据
                  </div>
                )}
              </div>

              {/* 餐类分布 */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">
                  🍽️ 餐类分布
                </h3>
                {categoryPieData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={200}>
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {categoryPieData.map((item, index) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-gray-300">{item.name}</span>
                          <span className="text-gray-500 ml-auto">
                            {item.value}次
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    暂无数据
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-3 border-t border-gray-700 flex justify-between items-center">
          <button
            onClick={handleClearAll}
            disabled={loading || history.length === 0}
            className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ 清空所有
          </button>
          <button
            onClick={onClose}
            className="bg-cyan-500 text-black px-6 py-2 rounded font-bold hover:bg-cyan-400 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default History;
