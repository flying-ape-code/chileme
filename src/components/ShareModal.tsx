import React from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareContent?: {
    title: string;
    description: string;
    url: string;
  };
}

export default function ShareModal({ isOpen, onClose, shareContent }: ShareModalProps) {
  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareContent?.url || window.location.href);
    alert('链接已复制！');
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
  };

  return (
    <div className="share-modal fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">📤 分享</h2>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => handleShare('wechat')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
              💬
            </div>
            <span className="text-sm text-gray-600">微信</span>
          </button>
          
          <button
            onClick={() => handleShare('weibo')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100"
          >
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl">
              🌊
            </div>
            <span className="text-sm text-gray-600">微博</span>
          </button>
          
          <button
            onClick={() => handleShare('qq')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
              🐧
            </div>
            <span className="text-sm text-gray-600">QQ</span>
          </button>
          
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100"
          >
            <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white text-2xl">
              🔗
            </div>
            <span className="text-sm text-gray-600">复制链接</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-200 text-gray-800 rounded-full font-bold hover:bg-gray-300"
        >
          取消
        </button>
      </div>
    </div>
  );
}
