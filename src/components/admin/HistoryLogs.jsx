import React, { useState, useEffect } from 'react';
import { getAllHistory, deleteHistoryRecord } from '../../lib/historyService';

function HistoryLogs() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const result = await getAllHistory(100);
    if (result.success && result.records) {
      setRecords(result.records);
    }
    setLoading(false);
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('确定要删除这条历史记录吗？')) return;

    const result = await deleteHistoryRecord(recordId);
    if (result.success) {
      loadHistory();
      alert('记录已删除');
    } else {
      alert('删除失败：' + result.message);
    }
  };

  const filteredRecords = filter
    ? records.filter(r => r.action.toLowerCase().includes(filter.toLowerCase()))
    : records;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-cyber-cyan font-mono text-xs animate-pulse">加载历史记录...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold neon-text-cyan font-mono glitch-text">
          系统日志
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="筛选操作类型..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black/40 border border-cyber-cyan/30 text-cyber-cyan font-mono text-xs px-3 py-2 rounded w-48"
          />
          <button
            onClick={loadHistory}
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
                时间
              </th>
              <th className="text-left text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider p-3">
                用户
              </th>
              <th className="text-left text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider p-3">
                操作
              </th>
              <th className="text-left text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider p-3">
                详情
              </th>
              <th className="text-right text-cyber-cyan/60 font-mono text-xs uppercase tracking-wider p-3">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-cyan/10">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-cyber-cyan/5 transition-colors">
                <td className="p-3 text-gray-400 font-mono text-xs">
                  {new Date(record.created_at).toLocaleString('zh-CN')}
                </td>
                <td className="p-3">
                  <div className="text-white font-mono text-sm">
                    {record.user?.username || '未知用户'}
                  </div>
                  <div className="text-gray-500 font-mono text-xs">
                    {record.user?.email || ''}
                  </div>
                </td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 font-mono text-xs uppercase">
                    {record.action}
                  </span>
                </td>
                <td className="p-3 text-gray-400 font-mono text-xs max-w-md truncate">
                  {record.details || '-'}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="px-2 py-1 text-xs font-mono text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">
            暂无历史记录
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryLogs;
