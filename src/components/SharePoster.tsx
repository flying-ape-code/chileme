import React, { useRef, useEffect } from 'react';

interface SharePosterProps {
  foodName: string;
  category: string;
  foodImage?: string;
  onDownload?: () => void;
}

export default function SharePoster({ foodName, category, foodImage, onDownload }: SharePosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawPoster();
  }, [foodName, category, foodImage]);

  const drawPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = 600;
    canvas.height = 800;

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#1a0a1a');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // 装饰性圆圈
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(300, 200, 150, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 0, 234, 0.3)';
    ctx.beginPath();
    ctx.arc(300, 200, 180, 0, Math.PI * 2);
    ctx.stroke();

    // 标题
    ctx.fillStyle = '#00f7ff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎲 吃了么 🎲', 300, 80);

    // 副标题
    ctx.fillStyle = '#ff00ea';
    ctx.font = '24px sans-serif';
    ctx.fillText('命运的轮盘选中了', 300, 130);

    // 食品图片（如果有）
    if (foodImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = foodImage;
      img.onload = () => {
        // 绘制圆角矩形图片
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 350, 120, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 180, 230, 240, 240);
        ctx.restore();

        // 重新绘制其他内容
        drawTextContent(ctx, foodName, category);
      };
    } else {
      // 没有图片时绘制表情符号
      ctx.font = '120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(getCategoryEmoji(category), 300, 380);
      
      drawTextContent(ctx, foodName, category);
    }
  };

  const drawTextContent = (ctx: CanvasRenderingContext2D, foodName: string, category: string) => {
    // 食品名称
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(foodName, 300, 520);

    // 分类
    ctx.fillStyle = '#00f7ff';
    ctx.font = '28px sans-serif';
    ctx.fillText(getCategoryName(category), 300, 570);

    // 分隔线
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 600);
    ctx.lineTo(450, 600);
    ctx.stroke();

    // 底部文字
    ctx.fillStyle = '#ff00ea';
    ctx.font = '20px sans-serif';
    ctx.fillText('拒绝选择困难症', 300, 650);

    ctx.fillStyle = '#00f7ff';
    ctx.font = '16px sans-serif';
    ctx.fillText('🔗 chileme.flyincape.com', 300, 700);

    // 二维码占位符
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(250, 720, 100, 100);
    ctx.fillStyle = '#000000';
    ctx.font = '12px sans-serif';
    ctx.fillText('扫码获取', 300, 775);
    ctx.fillText('你的美食', 300, 790);
  };

  const getCategoryEmoji = (category: string): string => {
    const emojis: Record<string, string> = {
      'breakfast': '🌅',
      'lunch': '🍜',
      'afternoon-tea': '☕',
      'dinner': '🍽️',
      'night-snack': '🌙'
    };
    return emojis[category] || '🍴';
  };

  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'afternoon-tea': '下午茶',
      'dinner': '晚餐',
      'night-snack': '夜宵'
    };
    return names[category] || category;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `吃了么-${foodName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    onDownload?.();
  };

  return (
    <div className="share-poster">
      <canvas
        ref={canvasRef}
        className="hidden"
      />
      <div className="bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 rounded-2xl p-6 max-w-sm mx-auto">
        {/* 预览区域 */}
        <div className="aspect-[3/4] bg-black/40 rounded-xl overflow-hidden mb-4 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            width={600}
            height={800}
          />
        </div>
        
        {/* 下载按钮 */}
        <button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-pink text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          📥 保存海报
        </button>
      </div>
    </div>
  );
}
