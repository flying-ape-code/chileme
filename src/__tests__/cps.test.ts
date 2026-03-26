import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CPS_CONFIG, generateCPSLink, generateCPSLinkWithTracking } from '../config/cps';

// Mock environment variables - 使用实际默认值
vi.mock('vite', () => ({
  env: {
    VITE_MEITUAN_POSITION_ID: 'shipinwaimai',
    VITE_MEITUAN_CHANNEL_ID: '473920',
    VITE_MEITUAN_MINI_APP_ID: 'wxde8ac0a21135c0',
    VITE_CPS_ENABLED: 'true',
  },
}));

describe('CPS 功能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CPS 配置', () => {
    it('应该加载 CPS 配置', () => {
      expect(CPS_CONFIG).toBeDefined();
      expect(CPS_CONFIG.positionId).toBeDefined();
      expect(CPS_CONFIG.channelId).toBeDefined();
    });

    it('应该有默认的 positionId', () => {
      expect(CPS_CONFIG.positionId).toBe('shipinwaimai');
    });

    it('应该有默认的 channelId', () => {
      expect(CPS_CONFIG.channelId).toBe('473920');
    });

    it('应该有默认的 miniAppId', () => {
      expect(CPS_CONFIG.miniAppId).toBe('wxde8ac0a21135c0');
    });
  });

  describe('CPS 链接生成', () => {
    it('应该生成基础 CPS 链接', () => {
      const link = generateCPSLink();
      expect(link).toContain('u.meituan.com');
      expect(link).toContain('position_id=');
      expect(link).toContain('channel_id=');
    });

    it('应该包含正确的 positionId', () => {
      const link = generateCPSLink();
      expect(link).toContain(`position_id=${CPS_CONFIG.positionId}`);
    });

    it('应该包含正确的 channelId', () => {
      const link = generateCPSLink();
      expect(link).toContain(`channel_id=${CPS_CONFIG.channelId}`);
    });

    it('应该生成带追踪参数的 CPS 链接', () => {
      const trackingId = 'test123';
      const link = generateCPSLinkWithTracking(trackingId);
      expect(link).toContain(`tracking_id=${trackingId}`);
    });

    it('追踪参数为可选', () => {
      const link = generateCPSLinkWithTracking();
      expect(link).not.toContain('tracking_id=');
    });

    it('CPS 链接格式正确', () => {
      const link = generateCPSLink();
      const urlPattern = /^https:\/\/u\.meituan\.com\/cps\/promotion\?position_id=.+&channel_id=.+$/;
      expect(link).toMatch(urlPattern);
    });
  });

  describe('CPS 链接有效性', () => {
    it('CPS 链接应该是有效的 URL', () => {
      const link = generateCPSLink();
      expect(() => new URL(link)).not.toThrow();
    });

    it('CPS 链接应该使用 HTTPS', () => {
      const link = generateCPSLink();
      const url = new URL(link);
      expect(url.protocol).toBe('https:');
    });

    it('CPS 链接域名正确', () => {
      const link = generateCPSLink();
      const url = new URL(link);
      expect(url.hostname).toBe('u.meituan.com');
    });

    it('CPS 链接路径正确', () => {
      const link = generateCPSLink();
      const url = new URL(link);
      expect(url.pathname).toBe('/cps/promotion');
    });
  });
});
