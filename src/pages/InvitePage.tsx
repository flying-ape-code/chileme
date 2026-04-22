/**
 * Issue #41: 邀请页面
 * 展示邀请码、邀请统计、邀请列表、排行榜
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyInviteCode,
  getMyInvitations,
  getInviteStats,
  getInviteLeaderboard,
  type InvitationCode,
  type Invitation,
  type InviteStats,
  type LeaderboardEntry,
} from '../services/invitationService';
import { getUserPoints, type UserPoints } from '../services/pointsService';
import { generateShareUrl } from '../services/shareService';

const InvitePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [inviteCode, setInviteCode] = useState<InvitationCode | null>(null);
  const [stats, setStats] = useState<InviteStats>({
    totalInvited: 0,
    registeredCount: 0,
    firstUseCount: 0,
    completedCount: 0,
    totalPointsEarned: 0,
  });
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [activeTab, setActiveTab] = useState<'invite' | 'leaderboard'>('invite');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [code, statsData, invData, lbData, points] = await Promise.all([
        getMyInviteCode(),
        getInviteStats(),
        getMyInvitations(1, 20),
        getInviteLeaderboard(20),
        getUserPoints(),
      ]);
      
      setInviteCode(code);
      setStats(statsData);
      setInvitations(invData.invitations);
      setLeaderboard(lbData);
      setUserPoints(points);
    } catch (err) {
      console.error('加载邀请数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 复制链接
  const handleCopyLink = async () => {
    if (!inviteCode) return;
    const url = generateShareUrl(inviteCode.code);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 状态标签样式
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-gray-500/20 text-gray-400',
      registered: 'bg-blue-500/20 text-blue-400',
      first_use: 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-green-500/20 text-green-400',
    };
    const labels: Record<string, string> = {
      pending: '待注册',
      registered: '已注册',
      first_use: '已使用',
      completed: '已完成',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-mono">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cyber-dark/95 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
          >
            ←
          </button>
          <h1 className="text-lg font-bold">🎁 邀请好友</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="px-4 py-6 pb-24">
        {/* 积分卡片 */}
        {userPoints && (
          <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 rounded-2xl p-5 mb-6 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-400/70 text-sm">我的积分</p>
                <p className="text-3xl font-bold text-white mt-1">{userPoints.available_points}</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400/70 text-sm">VIP 等级</p>
                <p className="text-lg font-medium text-yellow-400 mt-1">
                  {userPoints.vip_level === 0 ? '普通用户' : `Lv.${userPoints.vip_level}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 邀请码卡片 */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-5 mb-6 border border-cyan-500/20">
          <h2 className="text-lg font-bold mb-3">🔑 我的邀请码</h2>
          
          {inviteCode ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-cyber-dark rounded-xl px-4 py-3 font-mono text-xl text-cyan-400 text-center tracking-widest border border-cyan-500/30">
                  {inviteCode.code}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCopyLink}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    copied
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30'
                  }`}
                >
                  {copied ? '✅ 已复制' : '🔗 复制邀请链接'}
                </button>
              </div>
              
              <p className="text-gray-400 text-xs mt-3 text-center">
                已使用 {inviteCode.used_count} / {inviteCode.max_uses} 次
              </p>
            </>
          ) : (
            <p className="text-gray-400 text-center py-4">暂无邀请码</p>
          )}
        </div>

        {/* 邀请奖励说明 */}
        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-2xl p-5 mb-6 border border-yellow-500/20">
          <h2 className="text-lg font-bold mb-3">🎁 邀请奖励</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-2xl mb-1">👤</p>
              <p className="text-yellow-400 font-bold text-lg">+50 分</p>
              <p className="text-gray-400 text-xs mt-1">好友注册</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-2xl mb-1">🎉</p>
              <p className="text-yellow-400 font-bold text-lg">+20 分</p>
              <p className="text-gray-400 text-xs mt-1">好友首次使用</p>
            </div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="flex mb-4 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'invite'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            👥 邀请记录 ({stats.totalInvited})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            🏆 排行榜
          </button>
        </div>

        {/* 邀请统计 */}
        {activeTab === 'invite' && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-cyan-400">{stats.registeredCount}</p>
              <p className="text-gray-400 text-xs mt-1">已注册</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-400">{stats.completedCount}</p>
              <p className="text-gray-400 text-xs mt-1">已完成</p>
            </div>
          </div>
        )}

        {/* 邀请记录列表 */}
        {activeTab === 'invite' && (
          <div className="space-y-2">
            {invitations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">👻</p>
                <p className="text-gray-400">还没有邀请记录</p>
                <p className="text-gray-500 text-sm mt-1">快分享邀请码给好友吧！</p>
              </div>
            ) : (
              invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {inv.invitee_email || '待注册'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(inv.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(inv.status)}
                </div>
              ))
            )}
          </div>
        )}

        {/* 排行榜 */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🏆</p>
                <p className="text-gray-400">暂无排行数据</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`bg-white/5 rounded-xl p-4 flex items-center gap-3 ${
                    index < 3 ? 'border border-yellow-500/30' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-300 text-black' :
                    index === 2 ? 'bg-orange-500 text-black' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{entry.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-bold">{entry.invite_count}</p>
                    <p className="text-gray-500 text-xs">人</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default InvitePage;
