import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, isLoggedIn } from '../utils/auth.jsx';
import { getProducts, deleteProduct as deleteProductUtil } from '../utils/productManager.jsx';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

function Admin() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('breakfast');
  const [products, setProducts] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const categories = [
    { id: 'breakfast', name: '早餐' },
    { id: 'lunch', name: '午餐' },
    { id: 'afternoon-tea', name: '下午茶' },
    { id: 'dinner', name: '晚餐' },
    { id: 'night-snack', name: '夜宵' }
  ];

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    loadProducts();
  }, [navigate]);

  const loadProducts = () => {
    const data = getProducts();
    setProducts(data);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (category, product) => {
    setEditingProduct({ ...product, category });
    setShowForm(true);
  };

  const handleDelete = async (category, productId) => {
    if (!window.confirm('确定要删除这个商品吗？')) {
      return;
    }

    const result = deleteProductUtil(category, productId);
    if (result.success) {
      loadProducts();
    } else {
      alert('删除失败：' + result.message);
    }
  };

  const handleFormSubmit = (formData) => {
    const { addProduct, updateProduct } = require('../utils/productManager');
    
    const result = editingProduct
      ? updateProduct(editingProduct.category, editingProduct.id, formData)
      : addProduct(formData.category, formData);

    if (result.success) {
      setShowForm(false);
      setEditingProduct(null);
      loadProducts();
    } else {
      alert('操作失败：' + result.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeCategoryName = categories.find(c => c.id === activeCategory)?.name || '';

  return (
    <div className="min-h-screen bg-cyber-dark text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-cyber-cyan/20">
          <div>
            <h1 className="text-3xl font-bold neon-text-cyan font-mono glitch-text">
              商品管理系统
            </h1>
            <p className="text-cyber-cyan/60 font-mono text-xs mt-2 tracking-wider uppercase">
              [ Admin Panel ]
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 border border-cyber-cyan/30 text-cyber-cyan font-mono text-xs uppercase hover:bg-cyber-cyan/10 transition-all"
            >
              返回首页
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-cyber-pink/30 text-cyber-pink font-mono text-xs uppercase hover:bg-cyber-pink/10 transition-all"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <nav className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 font-mono text-xs border transition-all uppercase tracking-wider ${
                activeCategory === cat.id
                  ? 'bg-cyber-cyan text-black border-cyber-cyan font-bold'
                  : 'border-cyber-cyan/30 text-cyber-cyan/70 hover:text-cyber-cyan hover:border-cyber-cyan bg-black/50'
              }`}
            >
              {cat.name}
              {products[cat.id] && ` (${products[cat.id].length})`}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="cyber-button py-2 px-6 text-sm font-mono"
            >
              + 添加商品
            </button>
          </div>
          <div className="text-cyber-cyan/40 font-mono text-xs">
            总计：{Object.values(products).reduce((sum, arr) => sum + arr.length, 0)} 个商品
          </div>
        </div>

        {/* Product List */}
        {products[activeCategory] && (
          <ProductList
            products={products[activeCategory]}
            category={activeCategory}
            categoryName={activeCategoryName}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}

export default Admin;
