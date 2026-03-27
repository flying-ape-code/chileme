// V3.0 UI 主题配置
// 设计风格：现代简约 + 温暖美食

export const v3Theme = {
  // 主色调 - 温暖橙
  colors: {
    primary: '#FF6B35',      // 温暖橙 - 主色
    primaryLight: '#FF8C61', // 浅橙 - hover
    primaryDark: '#E55A2B',  // 深橙 - active
    
    // 辅助色
    secondary: '#2E86AB',    // 海洋蓝 - 次要操作
    accent: '#F6BD60',       // 阳光黄 - 强调
    success: '#7CB342',      // 绿色 - 成功状态
    warning: '#FFA726',      // 橙色 - 警告
    error: '#EF5350',        // 红色 - 错误
    
    // 中性色
    text: {
      primary: '#1A1A2E',    // 主文本
      secondary: '#6B7280',  // 次要文本
      disabled: '#9CA3AF',   // 禁用文本
    },
    bg: {
      primary: '#FFFFFF',    // 主背景
      secondary: '#F9FAFB',  // 次要背景
      tertiary: '#F3F4F6',   // 第三背景
    },
    border: {
      light: '#E5E7EB',      // 浅边框
      medium: '#D1D5DB',     // 中边框
      dark: '#9CA3AF',       // 深边框
    },
  },
  
  // 字体
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'Fira Code, "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // 间距
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },
  
  // 圆角
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',  // 圆形
  },
  
  // 阴影
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  // 响应式断点
  breakpoints: {
    xs: '375px',   // 小手机
    sm: '425px',   // 大手机
    md: '768px',   // 平板
    lg: '1024px',  // 小屏电脑
    xl: '1280px',  // 标准桌面
    '2xl': '1536px', // 大屏
  },
  
  // 动画
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};

export type V3Theme = typeof v3Theme;
export default v3Theme;
