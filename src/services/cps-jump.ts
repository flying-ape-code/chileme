import { CPS_CONFIG } from '../config/cps';
import { trackClick, trackJump, isWeChat } from './cps-tracking';

export interface JumpOptions {
  couponId: string;
  couponLink: string;
  source: 'result' | 'detail' | 'list';
}

/**
 * 生成小程序跳转链接
 */
export function getMiniAppLink(options: JumpOptions): string {
  const { couponLink } = options;
  
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
 * 执行跳转
 */
export function jumpToCoupon(options: JumpOptions): void {
  // 记录点击埋点
  trackClick(options.couponId, options.source);
  
  // 根据环境选择跳转方式
  if (isWeChat()) {
    // 微信环境：跳转小程序
    window.location.href = getMiniAppLink(options);
    // 记录跳转埋点（延迟发送，确保跳转已触发）
    setTimeout(() => trackJump(options.couponId, options.source), 500);
  } else {
    // 非微信环境：跳转 H5
    const newWindow = window.open(getH5Link(options), '_blank');
    // 记录跳转埋点
    if (newWindow) {
      trackJump(options.couponId, options.source);
    }
  }
}
