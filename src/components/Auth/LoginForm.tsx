import { useState } from 'react';
import { login } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState(''); // 用户名或邮箱
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('请输入用户名/邮箱和密码');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(identifier, password);

      if (result.success && result.user) {
        // 更新 AuthContext 中的用户状态
        setAuthUser(result.user);

        // 根据用户角色跳转
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || '登录失败，请稍后重试');
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-cyber-dark text-white">
      <div className="w-full max-w-md p-8 border border-cyber-cyan/30 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_30px_rgba(0,247,255,0.1)]">
        <h1 className="text-3xl font-bold mb-6 text-center neon-text-cyan glitch-text">
          登录
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
              用户名或邮箱
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2 bg-black/70 border border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(0,247,255,0.3)] outline-none transition-all font-mono text-sm"
              placeholder="输入用户名或邮箱"
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
              placeholder="输入密码"
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
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cyber-cyan/20 text-center">
          <p className="text-cyber-cyan/60 font-mono text-xs mb-2">
            还没有账号？
          </p>
          <button
            onClick={() => window.location.href = '/register'}
            className="text-cyber-cyan hover:text-cyber-cyan/80 font-mono text-xs uppercase tracking-wider transition-colors"
          >
            立即注册
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
