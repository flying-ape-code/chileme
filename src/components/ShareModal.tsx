import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  handleShare,
  generatePoster,
  generateShareContent,
  downloadPoster,
  type SharePlatform,
  type PosterConfig,
} from '../services/shareService';
import { getMyInviteCode } from '../services/invitationService';
import { awardPoints } from '../services/pointsService';

// 类型定义
export interface FoodItem {
  id: string | number;
  name: string;
  emoji: string;
  weirdName: string;
  weirdEmoji: string;
  img?: string;
  description?: string;
  promoUrl?: string;
}

export interface MealType {
  id: string;
  name: string;
  emoji: string;
}

// 分享短语
const sharePhrases = [
  '赛博之神为我选了这道菜！快来试试你的命运~',
  '算法说今天就该吃这个，不服不行！',
  '吃了么？让 AI 帮你决定！',
  '我的今日份美食已锁定，你的呢？',
  '潜运算法启动！今天的命运美食是...',
  '不试不知道，一试吓一跳！快来测测你的今日美食~',
  '命运齿轮开始转动... 今天吃这个！',
  '这不仅仅是一顿饭，这是一次灵魂的下载。',
];

interface ShareModalProps {
  isOpen: boolean;
  food: FoodItem;
  category: MealType;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ food, category, isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'share' | 'poster'>('share');
  const [posterImage, setPosterImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // 加载邀请码
  useEffect(() => {
    if (isOpen && user) {
      loadInviteCode();
    }
  }, [isOpen, user]);

  const loadInviteCode = async () => {
    const code = await getMyInviteCode();
    if (code) setInviteCode(code.code);
  };

  // 生成海报
  const handleGeneratePoster = useCallback(async () => {
    setIsGenerating(true);
    try {
      const phrase = sharePhrases[Math.floor(Math.random() * sharePhrases.length)];
      
      const config: PosterConfig = {
        width: 400,
        height: 600,
        foodName: food.weirdName || food.name,
        foodEmoji: food.weirdEmoji || food.emoji || '🍽️',
        category: `${category.emoji} ${category.name}`,
        phrase,
        appName: '吃了么',
        appUrl: window.location.origin,
        refCode: inviteCode || undefined,
      };
      
      const dataUrl = await generatePoster(config);
      setPosterImage(dataUrl);
    } catch (err) {
      console.error('海报生成失败:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [food, category, inviteCode]);

  // 处理分享
  const handlePlatformShare = async (platform: SharePlatform) => {
    const shareContent = generateShareContent(
      food.weirdName || food.name,
      food.weirdEmoji || food.emoji || '🍽️',
      `${category.emoji} ${category.name}`,
      inviteCode || undefined
    );
    
    const success = await handleShare(platform, shareContent, () => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    });
    
    if (success) {
      // 分享成功，关闭弹窗
      setTimeout(() => onClose(), 500);
    }
  };

  // 复制链接
  const handleCopyLink = async () => {
    const shareContent = generateShareContent(
      food.weirdName || food.name,
      food.weirdEmoji || food.emoji || '🍽️',
      `${category.emoji} ${category.name}`,
      inviteCode || undefined
    );
    
    try {
      await navigator.clipboard.writeText(shareContent.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 下载海报
  const handleDownloadPoster = () => {
    if (posterImage) {
      downloadPoster(posterImage, `chileme-${food.name}.png`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-cyan-900/50 to-purple-900 rounded-2xl max-w-md w-full border border-cyan-500/50 shadow-[0_0_50px_rgba(0,247,255,0.3)] animate-in zoom-in duration-300 overflow-hidden">
        
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          ✕
        </button>

        {/* 头部 */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-bold text-white text-center">📤 分享结果</h2>
          <p className="text-cyan-400/70 text-sm text-center mt-1">
            让朋友们也来试试命运美食！
          </p>
        </div>

        {/* Tab 切换 */}
        <div className="flex mx-6 mb-4 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'share'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            📤 直接分享
          </button>
          <button
            onClick={() => {
              setActiveTab('poster');
              if (!posterImage) handleGeneratePoster();
            }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'poster'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            🎨 生成海报
          </button>
        </div>

        {/* 内容区域 */}
        <div className="px-6 pb-6">
          {activeTab === 'share' ? (
            <>
              {/* 分享平台 */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { platform: 'wechat' as SharePlatform, label: '微信', icon: '💬', color: 'from-green-500 to-green-600' },
                  { platform: 'weibo' as SharePlatform, label: '微博', icon: '🌊', color: 'from-red-500 to-red-600' },
                  { platform: 'qq' as SharePlatform, label: 'QQ', icon: '🐧', color: 'from-blue-500 to-blue-600' },
                  { platform: 'system' as SharePlatform, label: '更多', icon: '📱', color: 'from-purple-500 to-purple-600' },
                ].map(({ platform, label, icon, color }) => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformShare(platform)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-95"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-2xl shadow-lg`}>
                      {icon}
                    </div>
                    <span className="text-xs text-gray-300">{label}</span>
                  </button>
                ))}
              </div>

              {/* 复制链接 */}
              <button
                onClick={handleCopyLink}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {copied ? (
                  <>✅ 链接已复制！</>
                ) : (
                  <>🔗 复制链接</>
                )}
              </button>

              {/* 邀请码提示 */}
              {inviteCode && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-400 text-sm text-center">
                    ✨ 分享链接已包含你的邀请码 <span className="font-mono font-bold">{inviteCode}</span>
                  </p>
                  <p className="text-yellow-400/60 text-xs text-center mt-1">
                    好友通过链接注册，双方均可获得积分奖励！
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* 海报预览 */}
              <div className="flex justify-center mb-4">
                {isGenerating ? (
                  <div className="w-[300px] h-[450px] bg-white/5 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-cyan-400 text-sm">生成中...</p>
                    </div>
                  </div>
                ) : posterImage ? (
                  <div className="relative">
                    <img
                      src={posterImage}
                      alt="分享海报"
                      className="w-[300px] h-auto rounded-xl shadow-lg"
                    />
                  </div>
                ) : (
                  <button
                    onClick={handleGeneratePoster}
                    className="w-[300px] h-[450px] bg-white/5 rounded-xl flex items-center justify-center border border-dashed border-white/20 hover:border-cyan-400/50 transition-all"
                  >
                    <div className="text-center">
                      <p className="text-4xl mb-3">🎨</p>
                      <p className="text-gray-400 text-sm">点击生成海报</p>
                    </div>
                  </button>
                )}
              </div>

              {/* 海报操作 */}
              {posterImage && !isGenerating && (
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadPoster}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg"
                  >
                    ⬇️ 下载海报
                  </button>
                  <button
                    onClick={handleGeneratePoster}
                    className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                  >
                    🔄 重新生成
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 分享成功提示 */}
        {shareSuccess && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-6 py-2 rounded-full text-sm font-medium animate-in slide-in-from-bottom duration-300">
            ✅ 分享成功！+10 积分
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
