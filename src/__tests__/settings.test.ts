// 设置管理模块单元测试
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  saveSettings,
  getSettings,
  resetSettings,
  getThemeConfig,
  getAnimationDuration,
  onSettingsChange,
  type AppSettings
} from '../lib/settings';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: function(key: string) { return this.store[key] || null; },
  setItem: function(key: string, value: string) { this.store[key] = value; },
  removeItem: function(key: string) { delete this.store[key]; },
  clear: function() { this.store = {}; }
};

vi.stubGlobal('localStorage', localStorageMock);
const windowMock = {
  addEventListenerCalls: [] as Array<{ event: string; handler: Function }>,
  removeEventListenerCalls: [] as Array<{ event: string; handler: Function }>,
  addEventListener: function(event: string, handler: Function) {
    this.addEventListenerCalls.push({ event, handler });
  },
  removeEventListener: function(event: string, handler: Function) {
    this.removeEventListenerCalls.push({ event, handler });
  }
};

vi.stubGlobal('window', windowMock);

describe('settings', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSettings', () => {
    it('应该返回默认设置当没有保存的设置时', () => {
      const settings = getSettings();
      
      expect(settings).toEqual({
        themeColor: 'cyan',
        animationSpeed: 'normal',
        soundEnabled: true,
        language: 'zh'
      });
    });

    it('应该返回已保存的设置', () => {
      const savedSettings = {
        themeColor: 'purple',
        animationSpeed: 'fast',
        soundEnabled: false,
        language: 'en'
      };
      
      localStorageMock.setItem('chileme_settings', JSON.stringify(savedSettings));
      const settings = getSettings();
      
      expect(settings).toEqual(savedSettings);
    });

    it('应该合并默认值和已保存的设置', () => {
      const partialSettings = {
        themeColor: 'green'
      };
      
      localStorageMock.setItem('chileme_settings', JSON.stringify(partialSettings));
      const settings = getSettings();
      
      expect(settings).toEqual({
        themeColor: 'green',
        animationSpeed: 'normal',
        soundEnabled: true,
        language: 'zh'
      });
    });

    it('应该在解析失败时返回默认设置', () => {
      localStorageMock.setItem('chileme_settings', 'invalid json');
      const settings = getSettings();
      
      expect(settings).toEqual({
        themeColor: 'cyan',
        animationSpeed: 'normal',
        soundEnabled: true,
        language: 'zh'
      });
    });
  });

  describe('saveSettings', () => {
    it('应该保存设置到 localStorage', () => {
      const newSettings = {
        themeColor: 'orange',
        soundEnabled: false
      };
      
      saveSettings(newSettings);
      
      expect(localStorageMock.store['chileme_settings']).toBeDefined();
      
      const saved = JSON.parse(localStorageMock.store['chileme_settings']);
      expect(saved.themeColor).toBe('orange');
      expect(saved.soundEnabled).toBe(false);
    });

    it('应该合并新设置与现有设置', () => {
      // 先保存一些设置
      localStorageMock.setItem('chileme_settings', JSON.stringify({
        themeColor: 'cyan',
        animationSpeed: 'slow'
      }));
      
      // 保存新设置
      saveSettings({ soundEnabled: false });
      
      const settings = getSettings();
      expect(settings.themeColor).toBe('cyan');
      expect(settings.animationSpeed).toBe('slow');
      expect(settings.soundEnabled).toBe(false);
    });

    it('应该在保存失败时不抛出异常', () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = function(key: string, value: string) { throw new Error('Storage full'); };
      
      expect(() => saveSettings({ themeColor: 'purple' })).not.toThrow();
      
      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('resetSettings', () => {
    it('应该清除 localStorage 中的设置', () => {
      localStorageMock.setItem('chileme_settings', JSON.stringify({
        themeColor: 'purple',
        animationSpeed: 'fast'
      }));
      
      resetSettings();
      
      expect(localStorageMock.store['chileme_settings']).toBeUndefined();
    });

    it('应该在重置后返回默认设置', () => {
      localStorageMock.setItem('chileme_settings', JSON.stringify({
        themeColor: 'purple',
        animationSpeed: 'fast'
      }));
      
      resetSettings();
      const settings = getSettings();
      
      expect(settings).toEqual({
        themeColor: 'cyan',
        animationSpeed: 'normal',
        soundEnabled: true,
        language: 'zh'
      });
    });

    it('应该在清除失败时不抛出异常', () => {
      const originalRemoveItem = localStorageMock.removeItem;
      localStorageMock.removeItem = function(key: string) { throw new Error('Permission denied'); };
      
      expect(() => resetSettings()).not.toThrow();
      
      localStorageMock.removeItem = originalRemoveItem;
    });
  });

  describe('getThemeConfig', () => {
    it('应该返回 cyan 主题配置', () => {
      const config = getThemeConfig('cyan');
      
      expect(config).toEqual({
        primary: 'cyan-400',
        secondary: 'blue-500',
        gradient: 'from-cyan-400 to-blue-500',
        shadow: 'shadow-cyan-500/50'
      });
    });

    it('应该返回 purple 主题配置', () => {
      const config = getThemeConfig('purple');
      
      expect(config).toEqual({
        primary: 'purple-400',
        secondary: 'pink-500',
        gradient: 'from-purple-400 to-pink-500',
        shadow: 'shadow-purple-500/50'
      });
    });

    it('应该返回 green 主题配置', () => {
      const config = getThemeConfig('green');
      
      expect(config).toEqual({
        primary: 'green-400',
        secondary: 'emerald-500',
        gradient: 'from-green-400 to-emerald-500',
        shadow: 'shadow-green-500/50'
      });
    });

    it('应该返回 orange 主题配置', () => {
      const config = getThemeConfig('orange');
      
      expect(config).toEqual({
        primary: 'orange-400',
        secondary: 'red-500',
        gradient: 'from-orange-400 to-red-500',
        shadow: 'shadow-orange-500/50'
      });
    });
  });

  describe('getAnimationDuration', () => {
    it('应该返回 slow 动画时长 3000ms', () => {
      expect(getAnimationDuration('slow')).toBe(3000);
    });

    it('应该返回 normal 动画时长 2000ms', () => {
      expect(getAnimationDuration('normal')).toBe(2000);
    });

    it('应该返回 fast 动画时长 1000ms', () => {
      expect(getAnimationDuration('fast')).toBe(1000);
    });
  });

  describe('onSettingsChange', () => {
    beforeEach(() => {
      windowMock.addEventListenerCalls = [];
      windowMock.removeEventListenerCalls = [];
    });

    it('应该注册 storage 事件监听器', () => {
      const callback = vi.fn();
      onSettingsChange(callback);
      
      expect(windowMock.addEventListenerCalls.length).toBe(1);
      expect(windowMock.addEventListenerCalls[0].event).toBe('storage');
    });

    it('应该在设置变化时调用回调', () => {
      const callback = vi.fn();
      onSettingsChange(callback);
      
      // 获取注册的 handler
      const handler = windowMock.addEventListenerCalls[0].handler;
      
      // 模拟 storage 事件
      handler({
        key: 'chileme_settings',
        newValue: JSON.stringify({ themeColor: 'purple' })
      });
      
      expect(callback).toHaveBeenCalledWith({ themeColor: 'purple' });
    });

    it('应该忽略非设置相关的 storage 事件', () => {
      const callback = vi.fn();
      onSettingsChange(callback);
      
      const handler = windowMock.addEventListenerCalls[0].handler;
      
      handler({
        key: 'other_key',
        newValue: JSON.stringify({ some: 'data' })
      });
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('应该返回取消订阅函数', () => {
      const callback = vi.fn();
      const unsubscribe = onSettingsChange(callback);
      
      unsubscribe();
      
      expect(windowMock.removeEventListenerCalls.length).toBe(1);
      expect(windowMock.removeEventListenerCalls[0].event).toBe('storage');
    });

    it('应该在解析失败时不抛出异常', () => {
      const callback = vi.fn();
      onSettingsChange(callback);
      
      const handler = windowMock.addEventListenerCalls[0].handler;
      
      expect(() => {
        handler({
          key: 'chileme_settings',
          newValue: 'invalid json'
        });
      }).not.toThrow();
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
