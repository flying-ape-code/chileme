import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllFeedbacks, type Feedback } from '../lib/feedbackService';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#06b6d4', '#f59e0b', '#8b5cf6']; // cyan, yellow, purple
const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#10b981']; // pending, processing, resolved

export default function FeedbackStats() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    loadFeedbacks();
  }, [user, isAdmin, navigate]);

  const loadFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllFeedbacks({});
      setFeedbacks(data);
    } catch (error) {
      console.error('加载反馈失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optimized: Use useMemo for filtered data
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const now = new Date();
      const createdAt = new Date(f.created_at);
      const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (timeRange === '7d' && diffDays > 7) return false;
      if (timeRange === '30d' && diffDays > 30) return false;
      if (filterType !== 'all' && f.type !== filterType) return false;
      if (filterStatus !== 'all' && f.status !== filterStatus) return false;
      return true;
    });
  }, [feedbacks, timeRange, filterType, filterStatus]);

  // Optimized: Use useMemo for stats
  const stats = useMemo(() => ({
    total: filteredFeedbacks.length,
    pending: filteredFeedbacks.filter(f => f.status === 'pending').length,
    processing: filteredFeedbacks.filter(f => f.status === 'processing').length,
    resolved: filteredFeedbacks.filter(f => f.status === 'resolved').length
  }), [filteredFeedbacks]);

  // Optimized: Use useMemo for type distribution
  const typeData = useMemo(() => [
    { name: '建议', value: filteredFeedbacks.filter(f => f.type === 'suggestion').length },
    { name: '投诉', value: filteredFeedbacks.filter(f => f.type === 'complaint').length },
    { name: '其他', value: filteredFeedbacks.filter(f => f.type === 'other').length }
  ].filter(d => d.value > 0), [filteredFeedbacks]);

  // Optimized: Use useMemo for status distribution
  const statusData = useMemo(() => [
    { name: '待处理', value: stats.pending },
    { name: '处理中', value: stats.processing },
    { name: '已解决', value: stats.resolved }
  ].filter(d => d.value > 0), [stats]);

  // Optimized: Use useMemo for trend data
  const trendData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 0;
    if (days === 0) return [];

    const trendMap = new Map<string, number>();
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendMap.set(dateStr, 0);
    }

    filteredFeedbacks.forEach(f => {
      const dateStr = new Date(f.created_at).toISOString().split('T')[0];
      if (trendMap.has(dateStr)) {
        trendMap.set(dateStr, trendMap.get(dateStr)! + 1);
      }
    });

    return Array.from(trendMap.entries()).map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      count
    }));
  }, [filteredFeedbacks, timeRange]);

  // Optimized: Use useCallback for export function
  const handleExport = useCallback(() => {
    const headers = ['日期', '类型', '状态', '优先级', '内容', '联系方式'];
    const rows = filteredFeedbacks.map(f => [
      new Date(f.created_at).toLocaleDateString('zh-CN'),
      f.type,
      f.status,
      f.priority,
      f.content.replace(/[\n\r,]/g, ' '),
      f.contact || ''
    ]);

    const csvContent = [
      '\uFEFF', // BOM for Chinese characters
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `反馈数据_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredFeedbacks]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="w-48 h-8 bg-gray-700 rounded mb-2 animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="w-32 h-10 bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
                <div className="w-20 h-4 bg-gray-700 rounded mb-2"></div>
                <div className="w-16 h-10 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700 animate-pulse">
            <div className="flex gap-4">
              <div className="w-32 h-10 bg-gray-700 rounded"></div>
              <div className="w-32 h-10 bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
              <div className="w-40 h-6 bg-gray-700 rounded mb-4"></div>
              <div className="w-48 h-48 bg-gray-700 rounded-full mx-auto"></div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
              <div className="w-40 h-6 bg-gray-700 rounded mb-4"></div>
              <div className="w-48 h-48 bg-gray-700 rounded-full mx-auto"></div>
            </div>
          </div>

          {/* Trend Chart Skeleton */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
            <div className="w-40 h-6 bg-gray-700 rounded mb-4"></div>
            <div className="w-full h-64 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">📊 反馈统计</h1>
            <p className="text-gray-400">数据可视化分析</p>
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
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">时间范围</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
              >
                <option value="7d">近 7 天</option>
                <option value="30d">近 30 天</option>
                <option value="all">全部</option>
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
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
              >
                📥 导出 CSV
              </button>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 类型分布饼图 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">📋 反馈类型分布</h3>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </div>

          {/* 状态分布饼图 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">✅ 处理状态分布</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        {/* 趋势图 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📈 反馈趋势</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  name="反馈数量"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              暂无数据
            </div>
          )}
        </div>

        {/* 数据详情 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📋 数据详情</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-gray-400 font-mono text-sm">日期</th>
                  <th className="pb-3 text-gray-400 font-mono text-sm">类型</th>
                  <th className="pb-3 text-gray-400 font-mono text-sm">状态</th>
                  <th className="pb-3 text-gray-400 font-mono text-sm">优先级</th>
                  <th className="pb-3 text-gray-400 font-mono text-sm">内容</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((feedback) => (
                  <tr key={feedback.id} className="border-b border-gray-700/50">
                    <td className="py-3 text-gray-300 text-sm">
                      {new Date(feedback.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-3 text-gray-300 text-sm">
                      {feedback.type === 'suggestion' && '💡 建议'}
                      {feedback.type === 'complaint' && '⚠️ 投诉'}
                      {feedback.type === 'other' && '📝 其他'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-mono ${
                        statusOptions.find(s => s.value === feedback.status)?.color
                      }`}>
                        {statusOptions.find(s => s.value === feedback.status)?.label}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300 text-sm">
                      {feedback.priority === 'high' && '🔴 高'}
                      {feedback.priority === 'medium' && '🟡 中'}
                      {feedback.priority === 'low' && '🟢 低'}
                    </td>
                    <td className="py-3 text-gray-300 text-sm max-w-md truncate">
                      {feedback.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const statusOptions = [
  { value: 'pending', label: '待处理', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'processing', label: '处理中', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'resolved', label: '已解决', color: 'bg-green-500/20 text-green-400' },
  { value: 'rejected', label: '已拒绝', color: 'bg-red-500/20 text-red-400' }
];
