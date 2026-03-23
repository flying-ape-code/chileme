import { CPS_CONFIG } from '../config/cps';

export interface JumpOptions {
  couponId: string;
  couponLink: string;
  source: 'result' | 'detail' | 'list' | 'card';
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
 * 判断是否在微信环境
 */
export function isWeChat(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
}

/**
 * 判断是否在小程序环境
 */
export function isMiniProgram(): boolean {
  if (typeof window === 'undefined') return false;
  // @ts-ignore - wx is defined in WeChat Mini Program
  return typeof wx !== 'undefined' && wx.miniProgram;
}

/**
 * 执行跳转
 */
export function jumpToCoupon(options: JumpOptions): void {
  // 记录埋点
  trackClick(options);
  
  // 根据环境选择跳转方式
  if (isMiniProgram()) {
    // 小程序环境：使用 wx.navigateTo
    // @ts-ignore - wx is defined in WeChat Mini Program
    wx.navigateTo({
      url: getH5Link(options)
    });
  } else if (isWeChat()) {
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
async function trackClick(options: JumpOptions): Promise<void> {
  const event = {
    event: 'cps_coupon_click',
    couponId: options.couponId,
    source: options.source,
    timestamp: Date.now(),
    platform: isWeChat() ? 'miniprogram' : isMiniProgram() ? 'miniprogram' : 'h5',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    url: window.location.href,
  };
  
  // 发送到分析服务
  console.log('[CPS Click]', event);
  
  // 保存到本地存储（用于后续分析）
  saveClickEvent(event);
  
  // 发送到 Supabase 进行持久化存储
  try {
    const { supabase } = await import('../lib/supabaseClient');
    
    // 插入点击记录
    await supabase.from('cps_clicks').insert([{
      product_id: options.couponId,
      source: options.source,
      platform: event.platform,
      clicked_at: new Date().toISOString(),
    }]);
    
    // 更新商品点击计数（如果 meals 表存在）
    await supabase.rpc('increment_cps_click_count', { product_id: options.couponId });
  } catch (error) {
    console.warn('保存 CPS 点击事件到服务器失败:', error);
    // 失败时仍然保留本地记录
  }
}

/**
 * 保存点击事件到本地存储
 */
function saveClickEvent(event: any): void {
  try {
    const storageKey = 'cps_click_events';
    const existing = localStorage.getItem(storageKey);
    const events = existing ? JSON.parse(existing) : [];
    events.push(event);
    
    // 只保留最近 100 条记录
    if (events.length > 100) {
      events.shift();
    }
    
    localStorage.setItem(storageKey, JSON.stringify(events));
  } catch (error) {
    console.error('保存 CPS 点击事件失败:', error);
  }
}

/**
 * 获取本地存储的点击事件
 */
export function getClickEvents(): any[] {
  try {
    const storageKey = 'cps_click_events';
    const existing = localStorage.getItem(storageKey);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('获取 CPS 点击事件失败:', error);
    return [];
  }
}

/**
 * 清除本地存储的点击事件
 */
export function clearClickEvents(): void {
  try {
    localStorage.removeItem('cps_click_events');
  } catch (error) {
    console.error('清除 CPS 点击事件失败:', error);
  }
}
