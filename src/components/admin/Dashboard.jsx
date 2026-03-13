import React, { useState, useEffect } from 'react';
import { getUserStats } from '../../lib/userService';
import { getSpinStats } from '../../lib/spinService';
import { getHistoryStats } from '../../lib/historyService';

function Dashboard() {
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, users: 0 },
    spins: { totalSpins: 0, totalPoints: 0, averagePoints: 0 },
    history: { totalActions: 0, actionsByType: {} },
    loading: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [userStats, spinStats, historyStats] = await Promise.all([
      getUserStats(),
      getSpinStats(),
      getHistoryStats(),
    ]);

    setStats({
      users: userStats || { total: 0, admins: 0, users: 0 },
      spins: spinStats || { totalSpins: 0, totalPoints: 0, averagePoints: 0 },
      history: historyStats || { totalActions: 0, actionsByType: {} },
      loading: false,
    });
  };

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-cyber-cyan font-mono text-xs animate-pulse">加载统计数据...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold neon-text-cyan font-mono glitch-text">
        数据概览
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 用户统计 */}
        <div className="bg-black/40 border border-cyber-cyan/20 p-4 rounded">
          <h3 className="text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider mb-3">
            用户统计
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">总用户数</span>
              <span className="text-cyber-cyan font-mono text-lg">{stats.users.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">管理员</span>
              <span className="text-cyber-pink font-mono text-lg">{stats.users.admins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">普通用户</span>
              <span className="text-cyber-cyan font-mono text-lg">{stats.users.users}</span>
            </div>
          </div>
        </div>

        {/* 抽奖统计 */}
        <div className="bg-black/40 border border-cyber-pink/20 p-4 rounded">
          <h3 className="text-cyber-pink/60 font-mono text-xs uppercase tracking-wider mb-3">
            抽奖统计
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">总抽奖次数</span>
              <span className="text-cyber-pink font-mono text-lg">{stats.spins.totalSpins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">总积分</span>
              <span className="text-cyber-cyan font-mono text-lg">{stats.spins.totalPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">平均积分</span>
              <span className="text-cyber-cyan font-mono text-lg">{stats.spins.averagePoints}</span>
            </div>
          </div>
        </div>

        {/* 操作统计 */}
        <div className="bg-black/40 border border-cyber-cyan/20 p-4 rounded">
          <h3 className="text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider mb-3">
            操作统计
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">总操作数</span>
              <span className="text-cyber-cyan font-mono text-lg">{stats.history.totalActions}</span>
            </div>
            {Object.entries(stats.history.actionsByType).slice(0, 3).map(([action, count]) => (
              <div key={action} className="flex justify-between">
                <span className="text-gray-400 text-sm truncate">{action}</span>
                <span className="text-cyber-cyan font-mono text-lg">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
