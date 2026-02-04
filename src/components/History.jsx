import React, { useState, useEffect } from 'react';
import { getHistoryStats, getRecentHistory } from '../history';

function History({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' 或 'stats'
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Defer state updates to avoid cascading renders warning
      requestAnimationFrame(() => {
        const currentHistory = getRecentHistory(20);
        const currentStats = getHistoryStats();
        setHistory(currentHistory);
        setStats(currentStats);
      });
    }
  }, [isOpen]);

  const handleClearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      localStorage.removeItem('spinHistory');
      setHistory([]);
      setStats({});
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1小时内
      return '刚刚';
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else if (diff < 604800000) { // 7天内
      return `${Math.floor(diff / 86400000)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="bg-gray-900 border-2 border-cyan-400 rounded-lg w-[95%] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/50">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-cyan-400">
              🎲 源代码记录
            </h2>
            <span className="text-sm text-gray-400">
              {history.length} 次命运
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-cyan-500 text-black font-bold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              📋 列表
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'stats' ? 'bg-cyan-500 text-black font-bold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              📊 统计
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                  className={`bg-gray-800 hover:bg-gray-700 p-3 rounded border border-gray-700 hover:border-cyan-400 transition-all cursor-pointer ${
                    selectedEntry?.id === entry.id ? 'border-cyan-400 ring-2 ring-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {entry.categoryEmoji}
                      </span>
                      <span className="text-sm text-gray-300">
                        {entry.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  <div className="text-cyan-400 font-mono text-sm mb-1">
                    结果：{entry.winnerEmoji} {entry.winner}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {entry.items.join(', ')}
                  </div>
                  {entry.winner && entry.winner.includes('404') && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <span className="text-pink-500 text-xs animate-pulse">
                        ⚠️ 警告：检测到404错误
                      </span>
                    </div>
                  )}
                </div>
              ))}
              
              {history.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>暂无历史记录</p>
                  <p className="text-sm">开始你的第一次命运抽取吧！</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">
                  📊 统计数据
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">总抽奖次数</div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {stats.totalSpins || 0}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">今日抽奖</div>
                    <div className="text-2xl font-bold text-green-400">
                      {history.filter(h => {
                        const today = new Date().toDateString();
                        return new Date(h.timestamp).toDateString() === today;
                      }).length}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-md font-bold text-cyan-400 mb-3">
                    最常抽中的食物
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(stats.mostFrequent || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([food, count], index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-900 rounded-lg p-2">
                        <span className="text-gray-300">{food}</span>
                        <span className="text-cyan-400 font-mono">{count}次</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-md font-bold text-cyan-400 mb-3">
                    餐类分布
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(stats.categoryBreakdown || {}).map(([emoji, count]) => (
                      <div key={emoji} className="flex items-center justify-between bg-gray-900 rounded-lg p-2">
                        <span className="text-xl">{emoji}</span>
                        <span className="text-gray-300 text-sm">{count}次</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-3 border-t border-gray-700 flex justify-between items-center">
          <button
            onClick={handleClearHistory}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            🗑️ 清空历史
          </button>
          <button
            onClick={onClose}
            className="bg-cyan-500 text-black px-4 py-2 rounded font-bold hover:bg-cyan-400 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default History;
