/**
 * Issue #41: 积分页面
 * 展示积分余额、积分获取方式、积分商城、交易记录
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getUserPoints,
  getStoreItems,
  redeemItem,
  getPointTransactions,
  getPointWays,
  POINT_TYPES,
  VIP_LEVELS,
  type UserPoints,
  type StoreItem,
  type PointTransaction,
} from '../services/pointsService';

const PointsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'store' | 'history' | 'ways'>('store');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemMessage, setRedeemMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [points, items, txData] = await Promise.all([
        getUserPoints(),
        getStoreItems(),
        getPointTransactions(1, 30),
      ]);
      
      setUserPoints(points);
      setStoreItems(items);
      setTransactions(txData.transactions);
    } catch (err) {
      console.error('加载积分数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 兑换商品
  const handleRedeem = async (itemId: string) => {
    setRedeemingId(itemId);
    setRedeemMessage(null);
    
    try {
      const result = await redeemItem(itemId);
      setRedeemMessage({ text: result.message, success: result.success });
      
      if (result.success) {
        // 重新加载数据
        setTimeout(() => loadData(), 1000);
      }
    } catch (err) {
      setRedeemMessage({ text: '兑换失败，请稍后重试', success: false });
    } finally {
      setRedeemingId(null);
    }
  };

  // VIP 状态显示
  const getVipStatus = () => {
    if (!userPoints) return { label: '普通用户', color: 'text-gray-400', isVip: false };
    
    if (userPoints.vip_expire_at && new Date(userPoints.vip_expire_at) > new Date()) {
      const daysLeft = Math.ceil(
        (new Date(userPoints.vip_expire_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      const level = VIP_LEVELS[userPoints.vip_level as keyof typeof VIP_LEVELS] || VIP_LEVELS[0];
      return {
        label: `${level.name} (${daysLeft}天)`,
        color: level.color,
        isVip: true,
      };
    }
    
    return { label: '普通用户', color: 'text-gray-400', isVip: false };
  };

  const vipStatus = getVipStatus();

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
          <h1 className="text-lg font-bold">💰 积分中心</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="px-4 py-6 pb-24">
        {/* 积分卡片 */}
        <div className="bg-gradient-to-r from-cyan-900/60 to-purple-900/60 rounded-2xl p-5 mb-6 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-400/70 text-sm">可用积分</p>
              <p className="text-4xl font-bold text-white mt-1">
                {userPoints?.available_points || 0}
              </p>
            </div>
            <div className="text-right">
              <p className="text-cyan-400/70 text-sm">累计获得</p>
              <p className="text-xl font-medium text-cyan-300 mt-1">
                {userPoints?.total_points || 0}
              </p>
            </div>
          </div>
          
          {/* VIP 状态 */}
          <div className={`mt-4 pt-4 border-t border-white/10 flex items-center justify-between ${vipStatus.color}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">👑</span>
              <span className="font-medium">{vipStatus.label}</span>
            </div>
            <button
              onClick={() => setActiveTab('store')}
              className="px-3 py-1 bg-white/10 rounded-full text-xs hover:bg-white/20 transition-all"
            >
              兑换 VIP
            </button>
          </div>
        </div>

        {/* 兑换消息提示 */}
        {redeemMessage && (
          <div className={`mb-4 p-3 rounded-xl text-center text-sm ${
            redeemMessage.success
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {redeemMessage.success ? '✅' : '❌'} {redeemMessage.text}
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex mb-4 bg-white/5 rounded-lg p-1">
          {[
            { key: 'store' as const, label: '🛒 积分商城' },
            { key: 'history' as const, label: '📋 交易记录' },
            { key: 'ways' as const, label: '💡 赚取积分' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 积分商城 */}
        {activeTab === 'store' && (
          <div className="space-y-3">
            {storeItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🏪</p>
                <p className="text-gray-400">商城暂无商品</p>
              </div>
            ) : (
              storeItems.map((item) => {
                const canAfford = (userPoints?.available_points || 0) >= item.points_cost;
                const stockLeft = item.stock === -1 ? '无限' : `${item.stock - item.stock_used}`;
                
                return (
                  <div
                    key={item.id}
                    className={`bg-white/5 rounded-xl p-4 border transition-all ${
                      canAfford ? 'border-cyan-500/30' : 'border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{item.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-yellow-400 font-bold">{item.points_cost} 积分</span>
                          <span className="text-gray-500 text-xs">库存: {stockLeft}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRedeem(item.id)}
                        disabled={!canAfford || redeemingId === item.id}
                        className={`ml-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          canAfford && redeemingId !== item.id
                            ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/50'
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {redeemingId === item.id ? '兑换中...' : '兑换'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 交易记录 */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-400">暂无交易记录</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const typeInfo = POINT_TYPES[tx.type as keyof typeof POINT_TYPES];
                
                return (
                  <div key={tx.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-lg">
                      {typeInfo?.icon || '📌'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{typeInfo?.label || tx.type}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(tx.created_at).toLocaleString('zh-CN')}
                      </p>
                      {tx.description && (
                        <p className="text-gray-400 text-xs mt-0.5">{tx.description}</p>
                      )}
                    </div>
                    <div className={`font-bold ${tx.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 赚取积分方式 */}
        {activeTab === 'ways' && (
          <div className="space-y-3">
            {getPointWays().map((way) => (
              <div key={way.type} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-2xl">
                    {way.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{way.label}</h3>
                      <span className="text-yellow-400 font-bold">+{way.points}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{way.description}</p>
                    {way.limit && (
                      <p className="text-gray-500 text-xs mt-1">⏰ {way.limit}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PointsPage;
