import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';
import { MEAL_CATEGORIES, Product, addProduct, updateProduct } from '../utils/productManager';

function Admin() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(MEAL_CATEGORIES[0].id);
  const [editingProduct, setEditingProduct] = useState<{ category: string; product: Product } | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setEditingProduct(null);
  };

  const handleAddProduct = (data: Omit<Product, 'id'>) => {
    addProduct(selectedCategory, data);
    window.location.reload(); // 刷新页面以显示新商品
  };

  const handleUpdateProduct = (category: string, productId: string, updates: Partial<Product>) => {
    updateProduct(category, productId, updates);
    setEditingProduct(null);
    window.location.reload(); // 刷新页面以显示更新
  };

  const handleEditProduct = (category: string, product: Product) => {
    setEditingProduct({ category, product });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">商品管理系统</h1>
            <p className="text-gray-400 text-sm">吃了么后台</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            退出登录
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6">
          {MEAL_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded transition-colors ${
                selectedCategory === category.id
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.emoji} {category.name}
            </button>
          ))}
        </div>

        {/* Product Form and List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProduct ? '编辑商品' : '添加商品'}
            </h2>
            {editingProduct ? (
              <ProductForm
                category={editingProduct.category}
                product={editingProduct.product}
                onSubmit={(data) => handleUpdateProduct(editingProduct.category, editingProduct.product.id, data)}
                onCancel={handleCancelEdit}
              />
            ) : (
              <ProductForm
                category={selectedCategory}
                onSubmit={handleAddProduct}
                onCancel={handleCancelEdit}
              />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-4">商品列表</h2>
            <ProductList
              category={selectedCategory}
              onEdit={handleEditProduct}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
