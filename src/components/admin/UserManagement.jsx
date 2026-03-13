import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../lib/userService';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();
    if (result.success && result.users) {
      setUsers(result.users);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm('确定要更改此用户的角色吗？')) return;

    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      loadUsers();
      alert('角色已更新');
    } else {
      alert('更新失败：' + result.message);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`确定要删除用户 "${username}" 吗？此操作不可逆！`)) return;

    const result = await deleteUser(userId);
    if (result.success) {
      loadUsers();
      alert('用户已删除');
    } else {
      alert('删除失败：' + result.message);
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-cyber-cyan font-mono text-xs animate-pulse">加载用户列表...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold neon-text-cyan font-mono glitch-text">
          用户管理
        </h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black/40 border border-cyber-cyan/30 text-cyber-cyan font-mono text-xs px-3 py-2 rounded"
          >
            <option value="all">全部用户</option>
            <option value="admin">管理员</option>
            <option value="user">普通用户</option>
          </select>
          <button
            onClick={loadUsers}
            className="cyber-button py-2 px-4 text-sm font-mono"
          >
            刷新
          </button>
        </div>
      </div>

      <div className="bg-black/40 border border-cyber-cyan/20 rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-cyber-cyan/10">
            <tr>
              <th className="text-left text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider p-3">
                用户名
              </th>
              <th className="text-left text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider p-3">
                邮箱
              </th>
              <th className="text-left text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider p-3">
                角色
              </th>
              <th className="text-left text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider p-3">
                注册时间
              </th>
              <th className="text-right text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider p-3">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-cyan/10">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-cyber-cyan/5 transition-colors">
                <td className="p-3 text-white font-mono text-sm">
                  {user.username}
                </td>
                <td className="p-3 text-gray-400 font-mono text-sm">
                  {user.email}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 font-mono text-xs uppercase ${
                    user.role === 'admin'
                      ? 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/30'
                      : 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-3 text-gray-400 font-mono text-xs">
                  {new Date(user.created_at).toLocaleDateString('zh-CN')}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    {user.role === 'user' && (
                      <button
                        onClick={() => handleRoleChange(user.id, 'admin')}
                        className="px-2 py-1 text-xs font-mono text-cyber-pink border border-cyber-pink/30 hover:bg-cyber-pink/10 transition-colors"
                      >
                        设为管理员
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleRoleChange(user.id, 'user')}
                        className="px-2 py-1 text-xs font-mono text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-cyan/10 transition-colors"
                      >
                        降为普通用户
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="px-2 py-1 text-xs font-mono text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">
            暂无用户数据
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
