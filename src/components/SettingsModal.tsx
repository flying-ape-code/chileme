import React, { useState, useEffect } from 'react';
import {
  getSettings,
  saveSettings,
  resetSettings,
  type AppSettings,
  themeColors,
  getThemeConfig
} from '../lib/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

function SettingsModal({ isOpen, onClose, onSettingsChange }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>({
    themeColor: 'cyan',
    animationSpeed: 'normal',
    soundEnabled: true,
    language: 'zh'
  });

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveSettings(settings);
    onSettingsChange?.(settings);
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    const defaults = getSettings();
    setSettings(defaults);
    onSettingsChange?.(defaults);
  };

  if (!isOpen) return null;

  const themeOptions: { id: AppSettings['themeColor']; label: string; icon: string }[] = [
    { id: 'cyan', label: '赛博蓝', icon: '💎' },
    { id: 'purple', label: '霓虹紫', icon: '🔮' },
    { id: 'green', label: '矩阵绿', icon: '💚' },
    { id: 'orange', label: '火焰橙', icon: '🔥' }
  ];

  const speedOptions: { id: AppSettings['animationSpeed']; label: string; icon: string }[] = [
    { id: 'slow', label: '慢速', icon: '🐢' },
    { id: 'normal', label: '正常', icon: '🚶' },
    { id: 'fast', label: '快速', icon: '⚡' }
  ];

  const currentTheme = getThemeConfig(settings.themeColor);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-900 border-2 border-cyber-cyan rounded-lg w-[95%] max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/50">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700 sticky top-0">
          <h2 className="text-xl font-bold text-cyan-400">
            ⚙️ 个性化设置
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 主题颜色 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              🎨 主题颜色
            </label>
            <div className="grid grid-cols-2 gap-3">
              {themeOptions.map((option) => {
                const theme = themeColors[option.id];
                const isSelected = settings.themeColor === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSettings({ ...settings, themeColor: option.id })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `border-${theme.primary} bg-gray-800 shadow-lg shadow-${theme.primary}/30`
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className={`text-sm font-medium ${
                      isSelected ? `text-${theme.primary}` : 'text-gray-400'
                    }`}>
                      {option.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 动画速度 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              🎬 动画速度
            </label>
            <div className="grid grid-cols-3 gap-3">
              {speedOptions.map((option) => {
                const isSelected = settings.animationSpeed === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSettings({ ...settings, animationSpeed: option.id })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `border-${currentTheme.primary} bg-gray-800 shadow-lg shadow-${currentTheme.primary}/30`
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className={`text-sm font-medium ${
                      isSelected ? `text-${currentTheme.primary}` : 'text-gray-400'
                    }`}>
                      {option.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 音效开关 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              🔊 音效
            </label>
            <button
              onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                settings.soundEnabled
                  ? `border-${currentTheme.primary} bg-gray-800 shadow-lg shadow-${currentTheme.primary}/30`
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{settings.soundEnabled ? '🔊' : '🔇'}</span>
                <span className={`font-medium ${
                  settings.soundEnabled ? `text-${currentTheme.primary}` : 'text-gray-400'
                }`}>
                  {settings.soundEnabled ? '已开启' : '已关闭'}
                </span>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${
                settings.soundEnabled ? `bg-${currentTheme.primary}` : 'bg-gray-700'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full transform transition-transform mt-0.5 ${
                  settings.soundEnabled ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'
                }`} />
              </div>
            </button>
          </div>

          {/* 语言设置（预留） */}
          <div className="opacity-50 pointer-events-none">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              🌐 语言 (开发中)
            </label>
            <div className="p-3 rounded-lg border-2 border-gray-700 bg-gray-800/50 text-gray-500">
              多语言支持即将推出...
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-700 sticky bottom-0">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            🔄 重置为默认
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg bg-gradient-to-r ${currentTheme.gradient} text-white font-medium hover:opacity-90 transition-opacity shadow-lg ${currentTheme.shadow}`}
            >
              💾 保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
