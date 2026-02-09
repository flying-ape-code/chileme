import React, { useState, useEffect } from 'react';
import {
  generateShareText,
  generateShareUrl,
  copyToClipboard,
  openShareUrl,
  getPlatforms,
  generateShareImage,
  useWebShareApi,
  platforms
} from '../lib/share';
import type { FoodItem, MealType } from './CelebrationModal';

interface ShareModalProps {
  isOpen: boolean;
  food: FoodItem | null;
  category: MealType | null;
  onClose: () => void;
}

function ShareModal({ isOpen, food, category, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [shareImage, setShareImage] = useState<string>('');

  useEffect(() => {
    if (isOpen && food && category) {
      const text = generateShareText(food.name, category.name);
      const image = generateShareImage(food.name, category.name);
      setShareImage(image);
    }
  }, [isOpen, food, category]);

  if (!isOpen || !food || !category) return null;

  const shareData = {
    title: '吃了么 - 飞猿算法',
    text: generateShareText(food.name, category.name),
    url: generateShareUrl(food.name, category.name)
  };

  const handleShare = async (platform: typeof platforms[0]) => {
    if (platform.id === 'copy') {
      const success = await copyToClipboard(shareData.url);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else if (platform.id === 'wechat') {
      const success = await copyToClipboard(shareData.url);
      if (success) {
        alert('链接已复制！打开微信分享给好友吧！');
      }
    } else {
      openShareUrl(platform.getUrl(shareData), platform.id);
    }
  };

  const handleWebShare = async () => {
    const success = await useWebShareApi(shareData);
    if (!success) {
      alert('分享失败，请尝试其他方式');
    }
  };

  const canUseWebShare = 'share' in navigator;

  return (
    <div className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="bg-gray-900 border-2 border-cyber-cyan rounded-lg w-[95%] max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/50">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-xl font-bold text-cyan-400">
            📤 分享美食
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 分享卡片预览 */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">分享预览</div>
            <div className="bg-black rounded-lg p-4 border border-cyber-pink/30 mb-3">
              <img
                src={shareImage}
                alt="分享卡片"
                className="w-full h-auto rounded"
              />
            </div>
            <div className="text-cyber-cyan font-mono text-sm mb-1">
              {shareData.text}
            </div>
            <div className="text-gray-500 font-mono text-xs truncate">
              {shareData.url}
            </div>
          </div>

          {/* Web Share API 按钮（移动设备优先） */}
          {canUseWebShare && (
            <button
              onClick={handleWebShare}
              className="w-full py-3 bg-gradient-to-r from-cyber-cyan to-cyber-pink text-white font-bold rounded-lg hover:from-cyan-400 hover:to-pink-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,247,255,0.3)]"
            >
              🚀 使用系统分享
            </button>
          )}

          {/* 平台选择 */}
          <div>
            <div className="text-sm text-gray-400 mb-3">选择分享平台</div>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleShare(platform)}
                  className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyber-cyan rounded-lg transition-all duration-300 flex flex-col items-center gap-2 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {platform.icon}
                  </span>
                  <span className="text-sm text-gray-300">
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 复制成功提示 */}
          {copied && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-400 text-center animate-pulse">
              ✅ 链接已复制到剪贴板
            </div>
          )}

          {/* 提示信息 */}
          <div className="text-xs text-gray-500 text-center">
            <p>💡 提示：微信不支持直接分享，请复制链接后打开微信分享</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-3 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-cyan-500 text-black px-4 py-2 rounded font-bold hover:bg-cyan-400 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
