import React, { useState, useEffect } from 'react';
import { MEAL_CATEGORIES, Product } from '../utils/productManager';

interface ProductFormProps {
  category?: string;
  product?: Product;
  onSubmit: (data: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}

function ProductForm({ category = '', product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    category: product?.category || category,
    name: product?.name || '',
    img: product?.img || '',
    promoUrl: product?.promoUrl || ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        category: product.category,
        name: product.name,
        img: product.img,
        promoUrl: product.promoUrl
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.name || !formData.img) {
      alert('请填写所有必填字段');
      return;
    }

    onSubmit({
      ...formData,
      category: formData.category,
      crawledAt: new Date().toISOString()
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/50">
      <h2 className="text-xl font-bold text-cyan-400 mb-6">
        {product ? '编辑商品' : '添加商品'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            餐别 *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-cyan-500"
            required
          >
            <option value="">请选择餐别</option>
            {MEAL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            商品名称 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-cyan-500"
            placeholder="请输入商品名称"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            图片 URL *
          </label>
          <input
            type="url"
            value={formData.img}
            onChange={(e) => setFormData({ ...formData, img: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-cyan-500"
            placeholder="请输入图片 URL"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            推广链接
          </label>
          <input
            type="url"
            value={formData.promoUrl}
            onChange={(e) => setFormData({ ...formData, promoUrl: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-cyan-500"
            placeholder="请输入美团推广链接"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-600 text-white font-bold py-2 rounded hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 bg-cyan-500 text-white font-bold py-2 rounded hover:bg-cyan-600 transition-colors"
          >
            {product ? '保存' : '添加'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
