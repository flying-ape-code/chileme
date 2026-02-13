import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth.jsx';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username, password);
    
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-cyber-dark text-white">
      <div className="w-full max-w-md p-8 border border-cyber-cyan/30 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_30px_rgba(0,247,255,0.1)]">
        <h1 className="text-3xl font-bold mb-6 text-center neon-text-cyan glitch-text">
          管理员登录
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              required
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
              required
            />
          </div>
          
          {error && (
            <p className="text-cyber-pink font-mono text-xs">{error}</p>
          )}
          
          <button
            type="submit"
            className="w-full cyber-button py-2 px-6 text-sm font-mono"
          >
            登录
          </button>
        </form>
        
        <div className="mt-6 pt-4 border-t border-cyber-cyan/20 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-cyber-cyan/60 hover:text-cyber-cyan font-mono text-xs uppercase tracking-wider transition-colors"
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
