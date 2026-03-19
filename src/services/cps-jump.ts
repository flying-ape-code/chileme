import { CPS_CONFIG } from '../config/cps';

export type JumpSource = 'result_page' | 'home_banner' | 'coupon_list';

export function jumpToMeituan(source: JumpSource = 'result_page', couponId?: string) {
  trackJump(source, couponId);
  
  if (isWeChat()) {
    jumpToMiniProgram();
  } else {
    jumpToH5();
  }
}

function isWeChat(): boolean {
  return /micromessenger/i.test(navigator.userAgent);
}

function jumpToMiniProgram() {
  // @ts-ignore
  if (typeof wx !== 'undefined') {
    // @ts-ignore
    wx.navigateToMiniProgram({
      appId: CPS_CONFIG.miniAppId,
      path: `pages/index/index?position_id=${CPS_CONFIG.positionId}&channel_id=${CPS_CONFIG.channelId}`,
      envVersion: 'release',
      success: () => console.log('跳转成功'),
      fail: () => jumpToH5(),
    });
  } else {
    jumpToH5();
  }
}

function jumpToH5() {
  const h5Url = `https://u.meituan.com/?position_id=${CPS_CONFIG.positionId}&channel_id=${CPS_CONFIG.channelId}`;
  window.open(h5Url, '_blank');
}

function trackJump(source: JumpSource, couponId?: string) {
  const event = { platform: 'meituan', source, timestamp: Date.now(), couponId };
  const key = 'cps_jump_events';
  const events = JSON.parse(localStorage.getItem(key) || '[]');
  events.push(event);
  if (events.length > 100) events.shift();
  localStorage.setItem(key, JSON.stringify(events));
  console.log('CPS 点击追踪:', event);
}

export function getJumpEvents() {
  return JSON.parse(localStorage.getItem('cps_jump_events') || '[]');
}
