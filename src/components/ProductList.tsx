import React, { useState, useEffect } from 'react';
import { MEAL_CATEGORIES, Product, getProductsByCategory, deleteProduct } from '../utils/productManager';

interface ProductListProps {
  category?: string;
  onEdit: (category: string, product: Product) => void;
}

function ProductList({ category, onEdit }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(category || MEAL_CATEGORIES[0].id);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = () => {
    const data = getProductsByCategory(selectedCategory);
    setProducts(data);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('确定要删除这个商品吗？')) {
      const success = deleteProduct(selectedCategory, productId);
      if (success) {
        loadProducts();
      } else {
        alert('删除失败');
      }
    }
  };

  const currentCategory = MEAL_CATEGORIES.find(cat => cat.id === selectedCategory);

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-cyan-400">
          商品列表
        </h2>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-cyan-500"
        >
          {MEAL_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.emoji} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 text-sm text-gray-400">
        共 {products.length} 个商品
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>该餐别暂无商品</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-700 p-4 rounded flex items-center gap-4"
            >
              <img
                src={product.img}
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-bold text-white">{product.name}</h3>
                <p className="text-sm text-gray-400">{currentCategory?.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(selectedCategory, product)}
                  className="px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
