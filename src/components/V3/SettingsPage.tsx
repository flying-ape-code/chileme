// V3.0 SettingsPage 设置页组件
import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Card } from './Card';
import { Button } from './Button';
import { Checkbox } from './Checkbox';

interface SettingItem {
  label: string;
  type: 'toggle' | 'link' | 'select';
  value?: any;
  onChange?: (value: any) => void;
  href?: string;
}

const SettingCard: React.FC<{ title: string; items: SettingItem[] }> = ({ title, items }) => {
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  return (
    <Card className="mt-4">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <div>
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between px-4 py-3 border-t border-gray-50 first:border-t-0">
            <span className="text-base text-gray-900">{item.label}</span>
            {item.type === 'toggle' && (
              <Checkbox
                checked={toggles[item.label] || false}
                onChange={(e) => setToggles({ ...toggles, [item.label]: e.target.checked })}
              />
            )}
            {item.type === 'link' && (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export const SettingsPage: React.FC = () => {
  const notificationItems: SettingItem[] = [
    { label: '推送通知', type: 'toggle' },
    { label: '声音提醒', type: 'toggle' },
    { label: '震动提醒', type: 'toggle' },
    { label: '优惠提醒', type: 'toggle' },
  ];

  const privacyItems: SettingItem[] = [
    { label: '隐私政策', type: 'link' },
    { label: '用户协议', type: 'link' },
    { label: '权限管理', type: 'link' },
  ];

  const accountItems: SettingItem[] = [
    { label: '账号安全', type: 'link' },
    { label: '绑定手机', type: 'link' },
    { label: '第三方绑定', type: 'link' },
    { label: '注销账号', type: 'link' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="设置" showBack />
      
      <main className="p-4">
        <SettingCard title="通知设置" items={notificationItems} />
        <SettingCard title="隐私与安全" items={privacyItems} />
        <SettingCard title="账号管理" items={accountItems} />
        
        <div className="mt-8 px-4">
          <Button variant="outline" className="w-full text-red-500 border-red-500 hover:bg-red-50">
            退出登录
          </Button>
          <p className="text-center text-xs text-gray-400 mt-4">
            吃了么 V3.0.0 | Build 2026.03.27
          </p>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
