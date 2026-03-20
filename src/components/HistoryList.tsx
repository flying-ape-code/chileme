import React, { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  timestamp: string;
  category: string;
  categoryEmoji: string;
  winner: string;
  winnerEmoji: string;
}

export default function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('spinHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem('spinHistory', JSON.stringify(newHistory));
  };

  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem('spinHistory');
  };

  return (
    <div className="history-list bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">📋 历史记录</h2>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            清空全部
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-gray-400 text-center py-8">暂无历史记录</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((item, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-white font-bold">
                  {item.categoryEmoji} {item.winner}
                </p>
                <p className="text-gray-400 text-sm">
                  {new Date(item.timestamp).toLocaleString('zh-CN')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(index)}
                className="text-gray-400 hover:text-red-400"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
