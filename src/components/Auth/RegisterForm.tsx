import { useState } from 'react';
import { register } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 表单验证
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    if (!password || !validatePassword(password)) {
      setError('密码至少需要 6 个字符');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(username, email, password);

      if (result.success && result.user) {
        // 注册成功，跳转到主页或管理后台
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || '注册失败，请稍后重试');
      }
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-cyber-dark text-white">
      <div className="w-full max-w-md p-8 border border-cyber-cyan/30 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_30px_rgba(0,247,255,0.1)]">
        <h1 className="text-3xl font-bold mb-6 text-center neon-text-cyan glitch-text">
          注册账号
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-black/70 border border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(0,247,255,0.3)] outline-none transition-all font-mono text-sm"
              placeholder="输入用户名"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-black/70 border border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(0,247,255,0.3)] outline-none transition-all font-mono text-sm"
              placeholder="输入邮箱"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-black/70 border border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(0,247,255,0.3)] outline-none transition-all font-mono text-sm"
              placeholder="输入密码（至少 6 位）"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-black/70 border border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(0,247,255,0.3)] outline-none transition-all font-mono text-sm"
              placeholder="再次输入密码"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-cyber-pink font-mono text-xs">{error}</p>
          )}

          <button
            type="submit"
            className={`w-full cyber-button py-2 px-6 text-sm font-mono ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cyber-cyan/20 text-center">
          <p className="text-cyber-cyan/60 font-mono text-xs mb-2">
            已有账号？
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-cyber-cyan hover:text-cyber-cyan/80 font-mono text-xs uppercase tracking-wider transition-colors"
          >
            立即登录
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-cyber-cyan/40 hover:text-cyber-cyan/60 font-mono text-[10px] uppercase tracking-wider transition-colors"
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
}
