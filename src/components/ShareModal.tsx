import React, { useState } from 'react';
import SharePoster from './SharePoster';
import PKModal from './PKModal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareContent?: {
    title: string;
    description: string;
    url: string;
    foodName?: string;
    category?: string;
    imageUrl?: string;
  };
  onCopySuccess?: () => void;
  onShareSuccess?: (platform: string) => void;
}

export default function ShareModal({ isOpen, onClose, shareContent, onCopySuccess, onShareSuccess }: ShareModalProps) {
  const [showPoster, setShowPoster] = useState(false);
  const [showPK, setShowPK] = useState(false);
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareContent?.url || window.location.href);
    onCopySuccess?.();
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(shareContent?.url || window.location.href);
    const title = encodeURIComponent(shareContent?.title || '吃了么');
    
    const shareUrls: Record<string, string> = {
      wechat: `https://wechat.com/share?url=${url}&title=${title}`,
      weibo: `https://service.weibo.com/share/share.php?url=${url}&title=${title}`,
      qq: `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}`,
    };

    window.open(shareUrls[platform] || '#', '_blank');
    onShareSuccess?.(platform);
  };

  return (
    <div 
      className="share-modal fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto relative animate-in zoom-in duration-300">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="关闭"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center pr-8">📤 分享</h2>
        
        {/* 特色功能 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setShowPoster(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-cyber-cyan/10 to-cyber-pink/10 border border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-all min-h-[100px]"
          >
            <div className="text-3xl">🎨</div>
            <span className="text-sm font-bold text-gray-800">生成海报</span>
          </button>
          
          <button
            onClick={() => setShowPK(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 hover:border-purple-400 transition-all min-h-[100px]"
          >
            <div className="text-3xl">⚔️</div>
            <span className="text-sm font-bold text-gray-800">好友 PK</span>
          </button>
        </div>
        
        {/* 社交平台分享 */}
        <div className="text-sm font-bold text-gray-600 mb-3">分享到</div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => handleShare('wechat')}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[80px]"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
              💬
            </div>
            <span className="text-xs text-gray-600 font-medium">微信</span>
          </button>
          
          <button
            onClick={() => handleShare('weibo')}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[80px]"
          >
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
              🌊
            </div>
            <span className="text-xs text-gray-600 font-medium">微博</span>
          </button>
          
          <button
            onClick={() => handleShare('qq')}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[80px]"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
              🐧
            </div>
            <span className="text-xs text-gray-600 font-medium">QQ</span>
          </button>
          
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[80px]"
          >
            <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
              🔗
            </div>
            <span className="text-xs text-gray-600 font-medium">复制链接</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-200 text-gray-800 rounded-full font-bold hover:bg-gray-300 transition-colors min-h-[48px]"
        >
          取消
        </button>

        {/* 海报弹窗 */}
        {showPoster && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowPoster(false)}
                className="absolute top-3 right-3 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600"
              >
                ✕
              </button>
              <SharePoster
                foodName={shareContent?.foodName || ''}
                category={shareContent?.category || ''}
                foodImage={shareContent?.imageUrl}
              />
            </div>
          </div>
        )}

        {/* PK 弹窗 */}
        {showPK && (
          <PKModal
            isOpen={showPK}
            onClose={() => setShowPK(false)}
            foodName={shareContent?.foodName}
            category={shareContent?.category}
            foodImage={shareContent?.imageUrl}
          />
        )}
      </div>
    </div>
  );
}
