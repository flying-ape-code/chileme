import React, { useState } from 'react';

function ProductForm({ product = null, categories, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    img: product?.img || '',
    promoUrl: product?.promoUrl || '',
    category: product?.category || categories[0]?.id || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('请输入商品名称');
      return;
    }
    
    if (!formData.img.trim()) {
      alert('请输入图片地址');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg border border-cyber-cyan/30 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_30px_rgba(0,247,255,0.1)]">
        <h2 className="text-xl font-bold mb-6 text-center neon-text-cyan p-4 border-b border-cyber-cyan/20">
          {product ? '编辑商品' : '添加商品'}
        </h2>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
              餐别分类
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-black/70 border border-cyber-cyan/30 text-white focus:border-cyber-cyan outline-none font-mono text-sm"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
              商品名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-black/70 border border-cyber-cyan/30 text-white focus:border-cyber-cyan outline-none font-mono text-sm"
              placeholder="例如：宫保鸡丁"
              required
            />
          </div>
          
          <div>
            <label className="block text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
              图片地址
            </label>
            <input
              type="url"
              value={formData.img}
              onChange={(e) => setFormData({ ...formData, img: e.target.value })}
              className="w-full px-4 py-2 bg-black/70 border border-cyber-cyan/30 text-white focus:border-cyber-cyan outline-none font-mono text-sm"
              placeholder="https://example.com/image.jpg"
              required
            />
            {formData.img && (
              <div className="mt-2 p-2 border border-cyber-cyan/10 bg-black/30 rounded">
                <img 
                  src={formData.img} 
                  alt="预览" 
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400/050505/00f7ff?text=Invalid+URL';
                  }}
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
              推广链接（可选）
            </label>
            <input
              type="url"
              value={formData.promoUrl}
              onChange={(e) => setFormData({ ...formData, promoUrl: e.target.value })}
              className="w-full px-4 py-2 bg-black/70 border border-cyber-cyan/30 text-white focus:border-cyber-cyan outline-none font-mono text-sm"
              placeholder="https://..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-cyber-cyan/30 text-cyber-cyan font-mono text-xs uppercase tracking-wider hover:bg-cyber-cyan/10 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 cyber-button py-2 px-6 text-sm font-mono"
            >
              {product ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
