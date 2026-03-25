export interface CPSConfig {
  dingdanxiaApiKey: string;
  meituanAppkey: string;
  positionId: string;
  channelId: string;
  miniAppId: string;
  enabled: boolean;
}

export const CPS_CONFIG: CPSConfig = {
  dingdanxiaApiKey: import.meta.env.VITE_DINGDANXIA_APIKEY || '',
  meituanAppkey: import.meta.env.VITE_MEITUAN_APPKEY || '',
  positionId: import.meta.env.VITE_MEITUAN_POSITION_ID || 'shipinwaimai',
  channelId: import.meta.env.VITE_MEITUAN_CHANNEL_ID || '473920',
  miniAppId: import.meta.env.VITE_MEITUAN_MINI_APP_ID || 'wxde8ac0a21135c0',
  enabled: import.meta.env.VITE_CPS_ENABLED === 'true',
};

// 使用订单侠 API 生成 CPS 链接
export async function generateCPSLink(productId: string): Promise<string> {
  const { dingdanxiaApiKey, positionId, channelId } = CPS_CONFIG;
  
  // 订单侠 API 端点
  const apiUrl = 'https://api.dingdanxia.com/api/cps/convert';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: dingdanxiaApiKey,
        type: 'meituan',
        position_id: positionId,
        channel_id: channelId,
        goods_id: productId,
      }),
    });
    
    const data = await response.json();
    
    if (data.code === 200 && data.data?.cps_url) {
      return data.data.cps_url;
    }
    
    throw new Error(data.message || 'CPS 链接生成失败');
  } catch (error) {
    console.error('生成 CPS 链接失败:', error);
    // 返回备用链接格式
    return `https://u.meituan.com/cps/promotion?position_id=${positionId}&goods_id=${productId}&channel_id=${channelId}`;
  }
}
