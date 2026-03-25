export interface CPSConfig {
  positionId: string;
  channelId: string;
  miniAppId: string;
  enabled: boolean;
  baseCPSUrl: string;
}

export const CPS_CONFIG: CPSConfig = {
  positionId: import.meta.env.VITE_MEITUAN_POSITION_ID || 'shipinwaimai',
  channelId: import.meta.env.VITE_MEITUAN_CHANNEL_ID || '473920',
  miniAppId: import.meta.env.VITE_MEITUAN_MINI_APP_ID || 'wxde8ac0a21135c0',
  enabled: import.meta.env.VITE_CPS_ENABLED === 'true',
  baseCPSUrl: 'https://u.meituan.com/cps/promotion',
};

// 生成 CPS 推广链接（不需要商品 ID）
export function generateCPSLink(): string {
  const { baseCPSUrl, positionId, channelId } = CPS_CONFIG;
  return `${baseCPSUrl}?position_id=${positionId}&channel_id=${channelId}`;
}

// 生成带追踪参数的 CPS 链接
export function generateCPSLinkWithTracking(trackingId?: string): string {
  const baseLink = generateCPSLink();
  if (trackingId) {
    return `${baseLink}&tracking_id=${trackingId}`;
  }
  return baseLink;
}
