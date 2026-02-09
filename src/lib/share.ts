// 社交媒体分享功能库

// 类型定义
export interface ShareData {
  title: string;
  text: string;
  url: string;
  imageUrl?: string;
}

export interface SharePlatform {
  id: 'twitter' | 'weibo' | 'wechat' | 'copy';
  name: string;
  icon: string;
  getUrl: (data: ShareData) => string;
}

// 平台配置
const platforms: SharePlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '🐦',
    getUrl: (data: ShareData) => {
      const text = encodeURIComponent(`${data.text} ${data.url}`);
      return `https://twitter.com/intent/tweet?text=${text}`;
    }
  },
  {
    id: 'weibo',
    name: '微博',
    icon: '📱',
    getUrl: (data: ShareData) => {
      const text = encodeURIComponent(`${data.text} ${data.url}`);
      return `http://service.weibo.com/share/share.php?title=${text}`;
    }
  },
  {
    id: 'wechat',
    name: '微信',
    icon: '💬',
    getUrl: (data: ShareData) => {
      // 微信不支持直接分享，返回 URL 用于复制
      return data.url;
    }
  },
  {
    id: 'copy',
    name: '复制链接',
    icon: '🔗',
    getUrl: (data: ShareData) => {
      return data.url;
    }
  }
];

// 生成分享文本
export const generateShareText = (foodName: string, category: string): string => {
  const phrases = [
    `今天${category}决定吃：${foodName}！🎲 #吃了么`,
    `命运的轮盘选中了：${foodName}！⚡ #吃了么`,
    `${category}吃什么？当然是${foodName}！😋 #吃了么`,
    `飞猿算法建议：${foodName}！🔥 #吃了么`,
    `拒绝选择困难，今天吃${foodName}！✨ #吃了么`
  ];
  
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// 生成分享 URL（用于复制链接）
export const generateShareUrl = (foodName: string, category: string): string => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    food: foodName,
    category: category,
    source: 'share'
  });
  return `${baseUrl}?${params.toString()}`;
};

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('复制失败：', error);
    return false;
  }
};

// 打开分享链接
export const openShareUrl = (url: string, platform: string): void => {
  if (platform === 'wechat') {
    // 微信需要显示二维码
    alert('请使用微信扫描二维码分享，或复制链接分享给好友');
  } else if (platform === 'copy') {
    // 复制链接，不打开新窗口
    return;
  } else {
    // 其他平台打开新窗口
    window.open(url, '_blank', 'width=600,height=400,resizable=yes,scrollbars=yes');
  }
};

// 获取平台列表
export const getPlatforms = (): SharePlatform[] => {
  return platforms;
};

// 生成分享卡片图片（模拟）
export const generateShareImage = (foodName: string, category: string): string => {
  // 实际项目中可以使用 html2canvas 或其他库生成图片
  // 这里返回一个占位符
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
      <rect width="400" height="200" fill="#0a0a0a"/>
      <text x="20" y="40" fill="#00f7ff" font-size="24" font-family="sans-serif">吃了么 ?</text>
      <text x="20" y="80" fill="#ffffff" font-size="32" font-family="sans-serif">${foodName}</text>
      <text x="20" y="120" fill="#ff00ea" font-size="16" font-family="sans-serif">${category}</text>
      <text x="20" y="180" fill="#00f7ff" font-size="12" font-family="sans-serif">🎲 飞猿算法</text>
    </svg>
  `)}`;
};

// 检测移动设备
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 使用 Web Share API（如果可用）
export const useWebShareApi = async (data: ShareData): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      });
      return true;
    } catch (error) {
      console.error('分享失败：', error);
      return false;
    }
  }
  return false;
};

// 导出所有平台
export { platforms };
