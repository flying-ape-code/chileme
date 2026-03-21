import React from 'react';
import SettingsModal from '../components/SettingsModal';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleSettingsChange = (settings: any) => {
    // Settings are saved in localStorage by the component
    console.log('Settings updated:', settings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            ← 返回首页
          </button>
        </div>
        <SettingsModal
          isOpen={true}
          onClose={handleClose}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  );
}
