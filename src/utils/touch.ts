/**
 * 触摸设备检测工具
 * 用于区分触摸设备和鼠标设备，优化交互体验
 */

let isTouchDeviceCache: boolean | null = null;

/**
 * 检测当前设备是否为触摸设备
 * @returns boolean - 是否为触摸设备
 */
export const isTouchDevice = (): boolean => {
  // 使用缓存避免重复计算
  if (isTouchDeviceCache !== null) {
    return isTouchDeviceCache;
  }

  // SSR 环境返回 false
  if (typeof window === 'undefined') {
    isTouchDeviceCache = false;
    return false;
  }

  // 检测触摸能力
  const hasTouchCapability = 
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - 某些浏览器使用 msMaxTouchPoints
    (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);

  // 检测是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // 综合判断：有触摸能力或者是移动设备
  isTouchDeviceCache = hasTouchCapability || isMobile;
  return isTouchDeviceCache;
};

/**
 * 清除触摸设备检测缓存
 * 在设备方向改变或用户明确切换输入方式时调用
 */
export const clearTouchDeviceCache = (): void => {
  isTouchDeviceCache = null;
};

/**
 * 获取合适的点击事件处理器
 * 触摸设备使用 onTouchEnd，鼠标设备使用 onClick
 * @param onClick - 鼠标点击处理函数
 * @param onTouch - 触摸结束处理函数（可选）
 * @returns 事件处理器对象
 */
export const getClickHandlers = (
  onClick: () => void,
  onTouch?: () => void
) => {
  const isTouch = isTouchDevice();
  
  if (isTouch) {
    return {
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault(); // 防止触发点击
        if (onTouch) onTouch();
        else onClick();
      },
      onClick: undefined // 触摸设备禁用 onClick，避免双重触发
    };
  } else {
    return {
      onClick,
      onTouchEnd: undefined
    };
  }
};
