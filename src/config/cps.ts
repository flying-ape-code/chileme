export interface CPSConfig {
  appkey: string;
  secret: string;
  positionId: string;
  channelId: string;
  miniAppId: string;
  enabled: boolean;
}

export const CPS_CONFIG: CPSConfig = {
  appkey: import.meta.env.VITE_MEITUAN_APPKEY || '',
  secret: import.meta.env.VITE_MEITUAN_SECRET || '',
  positionId: import.meta.env.VITE_MEITUAN_POSITION_ID || '',
  channelId: import.meta.env.VITE_MEITUAN_CHANNEL_ID || '',
  miniAppId: import.meta.env.VITE_MEITUAN_MINI_APP_ID || 'wxde8ac0a21135c0',
  enabled: import.meta.env.VITE_CPS_ENABLED === 'true',
};

export const MEITUAN_API_BASE = 'https://api.meituan.com';
