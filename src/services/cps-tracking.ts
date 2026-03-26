/**
 * CPS 数据埋点服务
 * Issue #30 - CPS 上线验证
 */

export interface CPSEvent {
  event: 'impression' | 'click' | 'jump' | 'conversion';
  couponId: string;
  source?: 'result' | 'detail' | 'list' | 'banner';
  platform?: 'miniprogram' | 'h5';
  timestamp: number;
  userId?: string;
  sessionId?: string;
  [key: string]: any;
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
 * 获取平台类型
 */
export function getPlatform(): 'miniprogram' | 'h5' {
  return isWeChat() ? 'miniprogram' : 'h5';
}

/**
 * 获取或创建会话 ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('cps_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('cps_session_id', sessionId);
  }
  return sessionId;
}

/**
 * 发送埋点事件
 */
async function sendEvent(event: CPSEvent): Promise<void> {
  const fullEvent: CPSEvent = {
    ...event,
    platform: event.platform || getPlatform(),
    sessionId: event.sessionId || getSessionId(),
    timestamp: Date.now(),
  };

  // 开发环境输出到控制台
  if (import.meta.env.DEV) {
    console.log('[CPS Tracking]', fullEvent);
  }

  // 生产环境发送到分析服务
  if (import.meta.env.PROD) {
    try {
      // 使用 sendBeacon 保证数据可靠发送（即使页面关闭）
      const blob = new Blob([JSON.stringify(fullEvent)], { type: 'application/json' });
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/cps', blob);
      } else {
        // 降级方案：使用 fetch
        await fetch('/api/analytics/cps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullEvent),
          keepalive: true,
        });
      }
    } catch (error) {
      console.error('[CPS Tracking] 发送失败:', error);
    }
  }
}

/**
 * 曝光事件（impression）
 * 当 CPS 商品卡片进入视口时触发
 */
export function trackImpression(couponId: string, source: 'result' | 'detail' | 'list' | 'banner' = 'result'): void {
  sendEvent({
    event: 'impression',
    couponId,
    source,
  });
}

/**
 * 点击事件（click）
 * 当用户点击 CPS 商品卡片时触发
 */
export function trackClick(couponId: string, source: 'result' | 'detail' | 'list' | 'banner' = 'result'): void {
  sendEvent({
    event: 'click',
    couponId,
    source,
  });
}

/**
 * 跳转事件（jump）
 * 当用户成功跳转到美团小程序/H5 时触发
 */
export function trackJump(couponId: string, source: 'result' | 'detail' | 'list' | 'banner' = 'result'): void {
  sendEvent({
    event: 'jump',
    couponId,
    source,
  });
}

/**
 * 转化事件（conversion）
 * 当用户完成购买时触发（需要通过回调或轮询）
 */
export function trackConversion(
  couponId: string,
  orderId?: string,
  amount?: number
): void {
  sendEvent({
    event: 'conversion',
    couponId,
    orderId,
    amount,
  });
}

/**
 * 批量发送事件（用于性能优化）
 */
export function trackBatch(events: CPSEvent[]): void {
  events.forEach(event => sendEvent(event));
}

/**
 * 使用 Intersection Observer 自动追踪曝光
 */
export function observeImpression(
  element: Element,
  couponId: string,
  source: 'result' | 'detail' | 'list' | 'banner' = 'result'
): () => void {
  let tracked = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !tracked) {
          tracked = true;
          trackImpression(couponId, source);
        }
      });
    },
    { threshold: 0.5 } // 50% 可见时触发
  );

  observer.observe(element);

  // 返回取消观察的函数
  return () => observer.disconnect();
}
