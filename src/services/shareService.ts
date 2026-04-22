/**
 * Issue #41: 分享服务
 * 负责分享事件记录、海报生成、分享渠道处理
 */

import { supabase } from '../lib/supabaseClient';

// ============================================
// 类型定义
// ============================================

export interface ShareContent {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  foodName?: string;
  foodEmoji?: string;
  category?: string;
  refCode?: string;
}

export interface ShareEvent {
  share_type: 'result' | 'poster' | 'invite' | 'general';
  platform: string;
  target_food_id?: string;
  target_food_name?: string;
  category?: string;
  ref_code?: string;
  session_id?: string;
}

export type SharePlatform = 'wechat' | 'weibo' | 'qq' | 'copy_link' | 'system';

// 分享配置
export const SHARE_CONFIG = {
  APP_NAME: '吃了么',
  APP_URL: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
  DEFAULT_TITLE: '吃了么 - 让算法帮你决定今天吃什么！',
  DEFAULT_DESCRIPTION: '赛博算命，吃啥不愁！快来试试你的今日命运美食~',
  POINTS_PER_SHARE: 10, // 每次分享获得的积分
};

// ============================================
// 分享链接生成
// ============================================

export function generateShareUrl(refCode?: string, foodName?: string): string {
  const params = new URLSearchParams();
  if (refCode) params.set('ref', refCode);
  if (foodName) params.set('food', encodeURIComponent(foodName));
  params.set('utm_source', 'share');
  params.set('utm_medium', 'social');
  
  const queryString = params.toString();
  return queryString 
    ? `${SHARE_CONFIG.APP_URL}/?${queryString}`
    : SHARE_CONFIG.APP_URL;
}

export function extractRefCode(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
}

export function extractShareSource(): { refCode: string | null; food: string | null } {
  const params = new URLSearchParams(window.location.search);
  return {
    refCode: params.get('ref'),
    food: params.get('food'),
  };
}

// ============================================
// 分享事件追踪
// ============================================

export async function trackShareEvent(event: Omit<ShareEvent, 'session_id'>): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    const { error } = await supabase.from('share_events').insert({
      ...event,
      session_id: sessionId,
    });
    if (error) console.warn('分享事件追踪失败:', error.message);
  } catch (err) {
    console.warn('分享事件追踪异常:', err);
  }
}

export async function trackConversion(
  refCode: string,
  action: 'click' | 'register' | 'first_use',
  userId?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('share_conversions').insert({
      ref_code: refCode,
      action,
      user_id: userId || null,
    });
    if (error) console.warn('转化追踪失败:', error.message);
  } catch (err) {
    console.warn('转化追踪异常:', err);
  }
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('chileme_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('chileme_session_id', sessionId);
  }
  return sessionId;
}

// ============================================
// 分享渠道处理
// ============================================

export function isWeChat(): boolean {
  if (typeof window === 'undefined') return false;
  return /micromessenger/i.test(navigator.userAgent);
}

export function isQQ(): boolean {
  if (typeof window === 'undefined') return false;
  return /qq\//i.test(navigator.userAgent) || /mqzone/i.test(navigator.userAgent);
}

export function getCurrentPlatform(): 'wechat' | 'qq' | 'weibo' | 'browser' {
  if (isWeChat()) return 'wechat';
  if (isQQ()) return 'qq';
  if (/weibo/i.test(navigator.userAgent)) return 'weibo';
  return 'browser';
}

export function getShareUrl(platform: SharePlatform, content: ShareContent): string {
  const url = encodeURIComponent(content.url);
  const title = encodeURIComponent(content.title);
  const desc = encodeURIComponent(content.description);
  
  switch (platform) {
    case 'wechat':
      return content.url;
    case 'weibo':
      return `https://service.weibo.com/share/share.php?url=${url}&title=${title}&desc=${desc}`;
    case 'qq':
      return `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&desc=${desc}&pics=${encodeURIComponent(content.imageUrl || '')}`;
    case 'copy_link':
      return content.url;
    case 'system':
      return content.url;
    default:
      return content.url;
  }
}

export async function handleShare(
  platform: SharePlatform,
  content: ShareContent,
  onAfterShare?: () => void
): Promise<boolean> {
  await trackShareEvent({
    share_type: content.refCode ? 'invite' : 'result',
    platform,
    target_food_name: content.foodName,
    category: content.category,
    ref_code: content.refCode,
  });
  
  if (platform === 'system' && navigator.share) {
    try {
      await navigator.share({
        title: content.title,
        text: content.description,
        url: content.url,
      });
      onAfterShare?.();
      return true;
    } catch (err) {
      console.warn('系统分享失败:', err);
    }
  }
  
  if (platform === 'copy_link') {
    try {
      await navigator.clipboard.writeText(content.url);
      onAfterShare?.();
      return true;
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = content.url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      onAfterShare?.();
      return true;
    }
  }
  
  const shareUrl = getShareUrl(platform, content);
  if (shareUrl && shareUrl !== content.url) {
    window.open(shareUrl, '_blank');
  }
  
  onAfterShare?.();
  return true;
}

// ============================================
// 海报生成
// ============================================

export interface PosterConfig {
  width: number;
  height: number;
  foodName: string;
  foodEmoji: string;
  category: string;
  phrase: string;
  appName: string;
  appUrl: string;
  refCode?: string;
}

export function generatePoster(config: PosterConfig): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 2;
    canvas.width = config.width * dpr;
    canvas.height = config.height * dpr;
    
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    
    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, config.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a3e');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.width, config.height);
    
    // 装饰边框
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, config.width - 20, config.height - 20);
    
    // 顶部标题
    ctx.fillStyle = '#00f7ff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍽️ 吃了么？', config.width / 2, 50);
    
    // 食物 emoji
    ctx.font = '80px sans-serif';
    ctx.fillText(config.foodEmoji, config.width / 2, 160);
    
    // 食物名称
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(config.foodName, config.width / 2, 230);
    
    // 分类
    ctx.fillStyle = 'rgba(0, 247, 255, 0.7)';
    ctx.font = '16px sans-serif';
    ctx.fillText(config.category, config.width / 2, 260);
    
    // 随机短语
    ctx.fillStyle = 'rgba(255, 107, 170, 0.9)';
    ctx.font = 'italic 14px sans-serif';
    const phraseLines = wrapText(ctx, config.phrase, config.width - 60);
    phraseLines.forEach((line, i) => {
      ctx.fillText(line, config.width / 2, 310 + i * 22);
    });
    
    // 邀请码提示
    if (config.refCode) {
      ctx.fillStyle = 'rgba(255, 200, 50, 0.8)';
      ctx.font = '12px sans-serif';
      ctx.fillText(`邀请码: ${config.refCode}`, config.width / 2, config.height - 100);
    }
    
    // 底部 APP 信息
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '14px sans-serif';
    ctx.fillText(config.appName, config.width / 2, config.height - 50);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '11px sans-serif';
    ctx.fillText(config.appUrl, config.width / 2, config.height - 30);
    
    resolve(canvas.toDataURL('image/png', 0.9));
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split('');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const char of words) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export function downloadPoster(dataUrl: string, filename: string = 'chileme-poster.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================
// 分享文案生成
// ============================================

const sharePhrases = [
  '赛博之神为我选了这道菜！快来试试你的命运~',
  '算法说今天就该吃这个，不服不行！',
  '吃了么？让 AI 帮你决定！',
  '我的今日份美食已锁定，你的呢？',
  '潜运算法启动！今天的命运美食是...',
  '不试不知道，一试吓一跳！快来测测你的今日美食~',
  '命运齿轮开始转动... 今天吃这个！',
];

export function generateShareContent(
  foodName: string,
  foodEmoji: string,
  category: string,
  refCode?: string
): ShareContent {
  const phrase = sharePhrases[Math.floor(Math.random() * sharePhrases.length)];
  const url = generateShareUrl(refCode, foodName);
  
  return {
    title: `吃了么？今日命运美食：${foodName}`,
    description: `${phrase} ${category} - ${foodName}`,
    url,
    foodName,
    foodEmoji,
    category,
    refCode,
  };
}
