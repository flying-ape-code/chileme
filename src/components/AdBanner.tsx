import React, { useState } from 'react';

interface AdBannerProps {
  imageUrl: string;
  linkUrl: string;
  altText?: string;
  onClose?: () => void;
}

const AdBanner: React.FC<AdBannerProps> = ({
  imageUrl,
  linkUrl,
  altText = '广告',
  onClose,
}) => {
  const [isClosed, setIsClosed] = useState(false);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClosed(true);
    onClose?.();
  };

  if (isClosed) {
    return null;
  }

  return (
    <div className="relative w-full max-w-md mx-auto my-2 sm:my-4 animate-in fade-in slide-in-from-top duration-500">
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg overflow-hidden border border-cyber-cyan/20 shadow-[0_0_15px_rgba(0,247,255,0.2)] hover:shadow-[0_0_25px_rgba(0,247,255,0.4)] transition-shadow duration-300"
      >
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-auto object-cover max-h-32 sm:max-h-40"
          loading="lazy"
        />
      </a>
      
      {/* 关闭按钮 */}
      <button
        onClick={handleClose}
        className="absolute -top-2 -right-2 w-6 h-6 bg-cyber-dark border border-cyber-cyan/30 rounded-full text-cyber-cyan hover:text-white hover:bg-cyber-pink transition-all duration-300 flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(0,247,255,0.3)]"
        aria-label="关闭广告"
      >
        ✕
      </button>
    </div>
  );
};

export default AdBanner;
