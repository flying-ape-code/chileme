import React, { useState, useEffect } from 'react';
import { createPKInvite, findPKByCode, acceptPKInvite, generatePKInviteLink } from '../lib/shareService';
import { useAuth } from '../context/AuthContext';

interface PKModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodName?: string;
  category?: string;
  onPKComplete?: (winner: string) => void;
}

export default function PKModal({ isOpen, onClose, foodName, category, onPKComplete }: PKModalProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<'create' | 'join' | 'waiting' | 'battle' | 'result'>('create');
  const [pkCode, setPkCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [myChoice, setMyChoice] = useState('');
  const [opponentChoice, setOpponentChoice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // 检查 URL 中是否有 PK 码
      const params = new URLSearchParams(window.location.search);
      const pkParam = params.get('pk');
      if (pkParam) {
        setMode('join');
        setInputCode(pkParam);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCreatePK = async () => {
    if (!user) {
      setError('请先登录');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const pk = await createPKInvite(user.id);
      if (pk) {
        setPkCode(pk.pk_code);
        setMode('waiting');
      } else {
        setError('创建 PK 失败');
      }
    } catch (err) {
      setError('创建 PK 异常');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinPK = async () => {
    if (!user) {
      setError('请先登录');
      return;
    }

    if (!inputCode || inputCode.length !== 6) {
      setError('请输入 6 位 PK 码');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const pk = await findPKByCode(inputCode.toUpperCase());
      if (pk) {
        setPkCode(pk.pk_code);
        setMode('battle');
      } else {
        setError('无效的 PK 码或 PK 已结束');
      }
    } catch (err) {
      setError('加入 PK 异常');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareInvite = () => {
    if (!user) return;
    
    const link = generatePKInviteLink(pkCode, user.id);
    navigator.clipboard.writeText(link);
    // 可以显示提示：链接已复制
  };

  const handleMakeChoice = () => {
    if (!myChoice) {
      setError('请先选择');
      return;
    }

    // 模拟对手选择（实际应该等待对手）
    const choices = ['火锅', '烧烤', '日料', '快餐', '西餐'];
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    setOpponentChoice(randomChoice);
    setMode('result');
  };

  const determineWinner = () => {
    // 简单逻辑：后选择的人获胜（实际应该由后端判断）
    return user?.username || '你';
  };

  const resetPK = () => {
    setMode('create');
    setPkCode('');
    setInputCode('');
    setMyChoice('');
    setOpponentChoice('');
    setError('');
    onClose();
  };

  return (
    <div 
      className="pk-modal fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in duration-300 text-white">
        {/* 关闭按钮 */}
        <button
          onClick={resetPK}
          className="absolute top-3 right-3 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          aria-label="关闭"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">⚔️ 好友 PK</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* 创建 PK */}
        {mode === 'create' && (
          <div className="space-y-4">
            <p className="text-center text-gray-300 mb-4">
              创建 PK 邀请，和好友比比谁更会吃！
            </p>
            
            <button
              onClick={handleCreatePK}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-bold hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50"
            >
              {isLoading ? '创建中...' : '🎮 创建 PK'}
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="w-full py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all"
            >
              📥 加入 PK
            </button>
          </div>
        )}

        {/* 加入 PK */}
        {mode === 'join' && (
          <div className="space-y-4">
            <p className="text-center text-gray-300 mb-4">
              输入 6 位 PK 码加入对战
            </p>
            
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="输入 PK 码"
              maxLength={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            <button
              onClick={handleJoinPK}
              disabled={isLoading || inputCode.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50"
            >
              {isLoading ? '加入中...' : '⚔️ 加入 PK'}
            </button>
            
            <button
              onClick={() => setMode('create')}
              className="w-full py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all"
            >
              ← 返回创建
            </button>
          </div>
        )}

        {/* 等待对手 */}
        {mode === 'waiting' && (
          <div className="space-y-4 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-300">
              等待好友加入 PK...
            </p>
            
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">你的 PK 码</p>
              <p className="text-3xl font-black tracking-widest text-cyan-400">{pkCode}</p>
            </div>
            
            <button
              onClick={handleShareInvite}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-full font-bold hover:from-green-600 hover:to-cyan-600 transition-all shadow-lg"
            >
              📤 分享邀请链接
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="w-full py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all"
            >
              切换加入 PK
            </button>
          </div>
        )}

        {/* PK 对战 */}
        {mode === 'battle' && (
          <div className="space-y-4">
            <p className="text-center text-gray-300 mb-4">
              你们今天谁吃得更健康？
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {['火锅', '烧烤', '日料', '快餐', '西餐', '素食'].map((choice) => (
                <button
                  key={choice}
                  onClick={() => setMyChoice(choice)}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    myChoice === choice
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleMakeChoice}
              disabled={!myChoice}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50"
            >
              🎯 提交选择
            </button>
          </div>
        )}

        {/* PK 结果 */}
        {mode === 'result' && (
          <div className="space-y-4 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-cyan-400">
              {determineWinner()} 获胜！
            </h3>
            
            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">你的选择</span>
                <span className="text-xl font-bold">{myChoice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">对手选择</span>
                <span className="text-xl font-bold">{opponentChoice}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400">
              🎉 获胜者获得 50 积分！
            </p>
            
            <button
              onClick={resetPK}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-bold hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg"
            >
              🎮 再来一局
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
