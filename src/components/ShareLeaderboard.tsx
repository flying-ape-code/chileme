import React, { useState, useEffect } from 'react';
import { getShareLeaderboard, getUserShareStats } from '../lib/shareService';
import { useAuth } from '../context/AuthContext';

interface ShareLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareLeaderboard({ isOpen, onClose }: ShareLeaderboardProps) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rank' | 'stats'>('rank');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [board, stats] = await Promise.all([
        getShareLeaderboard(20),
        user ? getUserShareStats(user.id) : null
      ]);
      setLeaderboard(board);
      setUserStats(stats);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      wechat: '💬',
      weixin: '🟢',
      qq: '🐧',
      qzone: '⭐',
      weibo: '🌊',
      twitter: '𝕏',
      link: '🔗'
    };
    return icons[platform] || '📤';
  };

  return (
    <div 
      className="share-leaderboard fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🏆 分享排行榜</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('rank')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === 'rank'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              排行榜
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === 'stats'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              我的统计
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : activeTab === 'rank' ? (
            /* 排行榜 */
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    entry.id === user?.id
                      ? 'bg-purple-50 border-2 border-purple-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl font-bold w-12 text-center">
                    {getRankEmoji(entry.rank)}
                  </div>
                  
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {entry.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">
                      {entry.username || '匿名用户'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {entry.total_shares || 0} 次分享
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      {entry.points || 0}
                    </p>
                    <p className="text-xs text-gray-400">积分</p>
                  </div>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>暂无分享记录</p>
                  <p className="text-sm mt-2">快来分享成为第一位吧！</p>
                </div>
              )}
            </div>
          ) : (
            /* 我的统计 */
            <div className="space-y-6">
              {userStats ? (
                <>
                  {/* 总览 */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-3xl font-black">{userStats.total_shares}</p>
                        <p className="text-sm opacity-80 mt-1">总分享</p>
                      </div>
                      <div>
                        <p className="text-3xl font-black">{userStats.total_points}</p>
                        <p className="text-sm opacity-80 mt-1">总积分</p>
                      </div>
                      <div>
                        <p className="text-3xl font-black">{userStats.rank || '-'}</p>
                        <p className="text-sm opacity-80 mt-1">排名</p>
                      </div>
                    </div>
                  </div>

                  {/* 平台分布 */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">📊 分享平台分布</h3>
                    <div className="space-y-2">
                      {Object.entries(userStats.shares_by_platform || {}).map(([platform, count]) => (
                        <div key={platform} className="flex items-center gap-3">
                          <span className="text-xl">{getPlatformIcon(platform)}</span>
                          <span className="text-sm text-gray-600 capitalize">{platform}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{
                                width: `${((count as number) / userStats.total_shares) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-700 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 成就 */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">🏅 成就徽章</h3>
                    <div className="grid grid-cols-4 gap-3">
                      <div className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                        userStats.total_shares >= 1 ? 'bg-yellow-100' : 'bg-gray-100 opacity-50'
                      }`}>
                        <span className="text-2xl">🌟</span>
                        <span className="text-xs text-gray-600 mt-1">首次分享</span>
                      </div>
                      <div className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                        userStats.total_shares >= 10 ? 'bg-purple-100' : 'bg-gray-100 opacity-50'
                      }`}>
                        <span className="text-2xl">🔥</span>
                        <span className="text-xs text-gray-600 mt-1">分享达人</span>
                      </div>
                      <div className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                        userStats.total_points >= 100 ? 'bg-pink-100' : 'bg-gray-100 opacity-50'
                      }`}>
                        <span className="text-2xl">💎</span>
                        <span className="text-xs text-gray-600 mt-1">积分高手</span>
                      </div>
                      <div className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                        userStats.rank && userStats.rank <= 3 ? 'bg-cyan-100' : 'bg-gray-100 opacity-50'
                      }`}>
                        <span className="text-2xl">👑</span>
                        <span className="text-xs text-gray-600 mt-1">排行榜</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">请先登录查看统计</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
