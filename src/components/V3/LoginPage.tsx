// V3.0 LoginPage 登录页组件
import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Checkbox } from './Checkbox';

interface LoginPageProps {
  onLogin?: (phone: string, code: string) => void;
  onRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [agree, setAgree] = useState(false);

  const handleSendCode = () => {
    if (!phone) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;
    onLogin?.(phone, code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FF6B35] to-[#FF8C61] flex flex-col">
      {/* 顶部装饰 */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>

      {/* 登录表单 */}
      <div className="bg-white rounded-t-3xl px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">欢迎回来</h1>
        <p className="text-gray-500 text-center mb-8">登录吃了么，发现更多美食</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="tel"
            placeholder="请输入手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
          />
          
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendCode}
              disabled={countdown > 0 || !phone}
              className="whitespace-nowrap"
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span className="text-sm text-gray-600">
              我已阅读并同意{' '}
              <a href="#" className="text-[#FF6B35]">用户协议</a>
              {' '}和{' '}
              <a href="#" className="text-[#FF6B35]">隐私政策</a>
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!agree || !phone || !code}
          >
            登录
          </Button>
        </form>

        {/* 其他登录方式 */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">其他登录方式</span>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-6">
            <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.5 10.5h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
              </svg>
            </button>
            <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          还没有账号？{' '}
          <button onClick={onRegister} className="text-[#FF6B35] font-medium">
            立即注册
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
