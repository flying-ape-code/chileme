import React, { useState } from 'react';

interface PKChallenge {
  id: string;
  challenger: string;
  challengerChoice: string;
  challengerImage?: string;
  category: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'completed';
}

interface PKModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodName?: string;
  category?: string;
  foodImage?: string;
}

export default function PKModal({ isOpen, onClose, foodName, category, foodImage }: PKModalProps) {
  const [pkCode, setPkCode] = useState<string | null>(null);
  const [challengeCode, setChallengeCode] = useState('');
  const [step, setStep] = useState<'create' | 'join'>('create');

  if (!isOpen) return null;

  const handleCreatePK = () => {
    // 生成 PK 挑战码
    const code = 'PK' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setPkCode(code);
    
    // TODO: 保存到数据库
    console.log('创建 PK 挑战:', {
      code,
      foodName,
      category,
      timestamp: new Date().toISOString()
    });
  };

  const handleJoinPK = () => {
    // TODO: 验证挑战码并加入
    console.log('加入 PK 挑战:', challengeCode);
    alert('PK 功能开发中...');
  };

  const handleSharePK = async () => {
    if (!pkCode) return;

    const shareText = `🎮 吃了么 PK 挑战\n\n我向你发起了美食 PK 挑战！\n挑战码：${pkCode}\n\n快来接受挑战吧！`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert('挑战码已复制！分享给好友来接受挑战吧~');
    } catch (err) {
      alert('复制失败，请手动复制挑战码');
    }
  };

  return (
    <div className="pk-modal fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in duration-300">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="关闭"
        >
          ✕
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">⚔️ 美食 PK</h2>
          <p className="text-gray-600">邀请好友进行美食对决</p>
        </div>

        {/* 选项卡切换 */}
        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setStep('create')}
            className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
              step === 'create'
                ? 'bg-white text-gray-800 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            发起挑战
          </button>
          <button
            onClick={() => setStep('join')}
            className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
              step === 'join'
                ? 'bg-white text-gray-800 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            加入挑战
          </button>
        </div>

        {/* 创建挑战 */}
        {step === 'create' && (
          <div className="space-y-4">
            {!pkCode ? (
              <>
                {/* 挑战预览 */}
                <div className="bg-gradient-to-r from-cyber-cyan/10 to-cyber-pink/10 rounded-xl p-4 border border-cyber-cyan/20">
                  <div className="text-center mb-3">
                    <div className="text-6xl mb-2">🎲</div>
                    <div className="font-bold text-gray-800">{foodName || '美食'}</div>
                    <div className="text-sm text-gray-600">{category || '分类'}</div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    发起挑战后，系统将生成一个专属挑战码，分享给好友即可接受挑战
                  </p>
                </div>

                <button
                  onClick={handleCreatePK}
                  className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-pink text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
                >
                  🎮 发起 PK 挑战
                </button>
              </>
            ) : (
              <>
                {/* 挑战码展示 */}
                <div className="bg-gradient-to-r from-cyber-cyan/20 to-cyber-pink/20 rounded-xl p-6 border-2 border-dashed border-cyber-cyan/40">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">你的挑战码</div>
                    <div className="text-4xl font-mono font-bold text-cyber-cyan tracking-wider mb-4">
                      {pkCode}
                    </div>
                    <button
                      onClick={handleSharePK}
                      className="w-full bg-white text-cyber-cyan border-2 border-cyber-cyan py-2.5 rounded-xl font-bold hover:bg-cyber-cyan/10 transition-colors"
                    >
                      📤 分享挑战
                    </button>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-500">
                  等待好友接受挑战...
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  完成
                </button>
              </>
            )}
          </div>
        )}

        {/* 加入挑战 */}
        {step === 'join' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600 mb-4">输入好友分享的挑战码</p>
            </div>

            <input
              type="text"
              value={challengeCode}
              onChange={(e) => setChallengeCode(e.target.value.toUpperCase())}
              placeholder="输入挑战码"
              maxLength={8}
              className="w-full text-center text-2xl font-mono tracking-widest py-4 border-2 border-gray-300 rounded-xl focus:border-cyber-cyan focus:outline-none transition-colors"
            />

            <button
              onClick={handleJoinPK}
              disabled={challengeCode.length < 8}
              className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-pink text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎮 加入 PK 挑战
            </button>
          </div>
        )}

        {/* PK 规则说明 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer font-bold text-gray-800 mb-2">📖 PK 规则说明</summary>
            <div className="space-y-2 text-xs">
              <div>1. 发起挑战后获得专属挑战码</div>
              <div>2. 分享挑战码给好友</div>
              <div>3. 好友输入挑战码接受挑战</div>
              <div>4. 双方各自转动轮盘选择美食</div>
              <div>5. 系统自动判定胜负</div>
              <div>6. 败者请客吃饭！😄</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
