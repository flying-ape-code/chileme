import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(username, password)) {
      navigate('/admin');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md border border-cyan-500/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">管理员登录</h1>
          <p className="text-gray-400 text-sm">吃了么后台管理系统</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-cyan-500"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-cyan-500"
              placeholder="请输入密码"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 text-white font-bold py-3 rounded hover:bg-cyan-600 transition-colors"
          >
            登录
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-xs">
          <p>默认账号: admin</p>
          <p>默认密码: 123456</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
