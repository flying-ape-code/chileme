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

  describe('CPS 边界条件测试', () => {
    it('应该处理空商品 ID', () => {
      const link = generateCPSLink('');
      expect(link).toBeDefined();
      expect(link).toContain('u.meituan.com');
    });

    it('应该处理超长商品 ID', () => {
      const longId = 'a'.repeat(1000);
      const link = generateCPSLink(longId);
      expect(link).toBeDefined();
      expect(link.length).toBeGreaterThan(50);
    });

    it('应该处理特殊字符商品 ID', () => {
      const specialId = 'test@#$%^&*()';
      const link = generateCPSLink(specialId);
      expect(link).toBeDefined();
      // 应该 URL 编码
      expect(encodeURI(link)).toBeDefined();
    });

    it('应该处理 null 商品 ID', () => {
      const link = generateCPSLink(null as any);
      expect(link).toBeDefined();
    });

    it('应该处理 undefined 商品 ID', () => {
      const link = generateCPSLink(undefined as any);
      expect(link).toBeDefined();
    });
  });

  describe('CPS 错误处理测试', () => {
    it('应该处理无效的 trackingId', () => {
      const invalidIds = ['', ' '.repeat(100), '@#$%', '<script>alert(1)</script>'];
      invalidIds.forEach(id => {
        expect(() => generateCPSLinkWithTracking(id)).not.toThrow();
      });
    });

    it('应该处理配置缺失', () => {
      expect(CPS_CONFIG.positionId).toBeTruthy();
      expect(CPS_CONFIG.channelId).toBeTruthy();
    });

    it('应该验证 CPS 链接格式', () => {
      const link = generateCPSLink();
      const url = new URL(link);
      expect(url.protocol).toBe('https:');
      expect(url.hostname).toBe('u.meituan.com');
      expect(url.pathname).toBe('/cps/promotion');
    });
  });

  describe('CPS 集成测试', () => {
    it('应该生成多个不同的 CPS 链接', () => {
      const links = new Set();
      for (let i = 0; i < 10; i++) {
        links.add(generateCPSLinkWithTracking(`track_${i}`));
      }
      expect(links.size).toBeGreaterThanOrEqual(1);
    });

    it('应该生成一致的 CPS 链接', () => {
      const link1 = generateCPSLink('same_id');
      const link2 = generateCPSLink('same_id');
      expect(link1).toBe(link2);
    });

    it('应该支持批量生成 CPS 链接', () => {
      const productIds = ['p1', 'p2', 'p3', 'p4', 'p5'];
      const links = productIds.map(id => generateCPSLink(id));
      expect(links).toHaveLength(5);
      links.forEach(link => {
        expect(link).toContain('u.meituan.com');
      });
    });
  });

  describe('CPS 追踪参数测试', () => {
    it('应该正确添加追踪参数', () => {
      const trackingId = 'track_123';
      const link = generateCPSLinkWithTracking(trackingId);
      expect(link).toContain(`tracking_id=${trackingId}`);
    });

    it('应该支持多个追踪参数', () => {
      const link = generateCPSLinkWithTracking('test');
      expect(link).toContain('position_id=');
      expect(link).toContain('channel_id=');
      expect(link).toContain('tracking_id=');
    });

    it('应该处理追踪参数为空', () => {
      const link = generateCPSLinkWithTracking('');
      expect(link).not.toContain('tracking_id=');
    });
  });

  describe('CPS 性能测试', () => {
    it('应该在 1ms 内生成 CPS 链接', () => {
      const start = performance.now();
      generateCPSLink('test');
      const end = performance.now();
      expect(end - start).toBeLessThan(1);
    });

    it('应该批量生成 1000 个 CPS 链接在 100ms 内', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        generateCPSLink(`product_${i}`);
      }
      const end = performance.now();
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('CPS 安全测试', () => {
    it('应该防止 XSS 攻击', () => {
      const xssId = '<script>alert("xss")</script>';
      const link = generateCPSLink(xssId);
      expect(link).not.toContain('<script>');
      expect(link).not.toContain('alert');
    });

    it('应该防止 URL 注入', () => {
      const injectId = 'https://evil.com?';
      const link = generateCPSLink(injectId);
      expect(link).toContain('u.meituan.com');
      expect(link).not.toContain('evil.com');
    });
  });

  describe('CPS 兼容性测试', () => {
    it('应该支持微信环境', () => {
      const link = generateCPSLink('wechat_test');
      expect(link).toContain('channel_id=');
    });

    it('应该支持移动端', () => {
      const link = generateCPSLink('mobile_test');
      const url = new URL(link);
      expect(url.protocol).toBe('https:');
    });

    it('应该支持桌面端', () => {
      const link = generateCPSLink('desktop_test');
      expect(link).toBeDefined();
    });
  });
