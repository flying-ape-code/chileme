import { CPS_CONFIG } from '../config/cps';

export interface JumpOptions {
  couponId: string;
  couponLink: string;
  source: 'result' | 'detail' | 'list';
}

/**
 * 生成小程序跳转链接
 */
export function getMiniAppLink(options: JumpOptions): string {
  const { couponId, couponLink } = options;
  
  // 美团小程序链接格式
  return `weixin://dl/business/?t=${encodeURIComponent(couponLink)}`;
}

/**
 * 生成 H5 跳转链接
 */
export function getH5Link(options: JumpOptions): string {
  const { couponLink } = options;
  return couponLink;
}

/**
 * 判断是否在微信环境
 */
export function isWeChat(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
}

/**
 * 执行跳转
 */
export function jumpToCoupon(options: JumpOptions): void {
  // 记录埋点
  trackClick(options);
  
  // 根据环境选择跳转方式
  if (isWeChat()) {
    // 微信环境：跳转小程序
    window.location.href = getMiniAppLink(options);
  } else {
    // 非微信环境：跳转 H5
    window.open(getH5Link(options), '_blank');
  }
}

/**
 * 埋点记录
 */
function trackClick(options: JumpOptions): void {
  const event = {
    event: 'cps_coupon_click',
    couponId: options.couponId,
    source: options.source,
    timestamp: Date.now(),
    platform: isWeChat() ? 'miniprogram' : 'h5',
  };
  
  // 发送到分析服务
  console.log('[CPS Click]', event);
  
  // TODO: 发送到实际的分析服务
  // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
}
