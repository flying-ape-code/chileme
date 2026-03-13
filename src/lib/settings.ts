// 设置管理工具

export interface AppSettings {
  themeColor: 'cyan' | 'purple' | 'green' | 'orange';
  animationSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
  language: 'zh' | 'en';
}

const SETTINGS_KEY = 'chileme_settings';

const defaultSettings: AppSettings = {
  themeColor: 'cyan',
  animationSpeed: 'normal',
  soundEnabled: true,
  language: 'zh'
};

// 主题颜色配置
export const themeColors = {
  cyan: {
    primary: 'cyan-400',
    secondary: 'blue-500',
    gradient: 'from-cyan-400 to-blue-500',
    shadow: 'shadow-cyan-500/50'
  },
  purple: {
    primary: 'purple-400',
    secondary: 'pink-500',
    gradient: 'from-purple-400 to-pink-500',
    shadow: 'shadow-purple-500/50'
  },
  green: {
    primary: 'green-400',
    secondary: 'emerald-500',
    gradient: 'from-green-400 to-emerald-500',
    shadow: 'shadow-green-500/50'
  },
  orange: {
    primary: 'orange-400',
    secondary: 'red-500',
    gradient: 'from-orange-400 to-red-500',
    shadow: 'shadow-orange-500/50'
  }
};

// 动画速度配置（毫秒）
export const animationSpeeds = {
  slow: 3000,
  normal: 2000,
  fast: 1000
};

// 保存设置
export function saveSettings(settings: Partial<AppSettings>): void {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// 获取设置
export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
}

// 重置为默认设置
export function resetSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to reset settings:', error);
  }
}

// 获取当前主题颜色配置
export function getThemeConfig(themeColor: AppSettings['themeColor']) {
  return themeColors[themeColor];
}

// 获取当前动画速度（毫秒）
export function getAnimationDuration(speed: AppSettings['animationSpeed']): number {
  return animationSpeeds[speed];
}

// 监听设置变化
export function onSettingsChange(callback: (settings: AppSettings) => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === SETTINGS_KEY && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
  };
  
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
