import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../lib/auth';
import { getProducts, deleteProduct as deleteProductFromSupabase, addProduct as addProductToSupabase, updateProduct as updateProductInSupabase } from '../lib/productService';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';
import Dashboard from '../components/admin/Dashboard';
import UserManagement from '../components/admin/UserManagement';
import SpinRecords from '../components/admin/SpinRecords';
import HistoryLogs from '../components/admin/HistoryLogs';

function Admin() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const adminTabs = [
    { id: 'dashboard', name: '数据概览', icon: '📊' },
    { id: 'products', name: '商品管理', icon: '🍱' },
    { id: 'users', name: '用户管理', icon: '👥' },
    { id: 'spins', name: '抽奖记录', icon: '🎰' },
    { id: 'history', name: '系统日志', icon: '📝' },
  ];

  const loadProducts = useCallback(async () => {
    const data = await getProducts();
    setProducts(data);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }

    if (!isLoading && user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    if (user && user.role === 'admin' && activeTab === 'products') {
      loadProducts();
    }
  }, [user, isLoading, navigate, loadProducts, activeTab]);

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

    const result = await deleteProductFromSupabase(category, productId);
    if (result.success) {
      loadProducts();
    } else {
      alert('删除失败：' + result.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    const result = editingProduct
      ? await updateProductInSupabase(editingProduct.category, editingProduct.id, formData)
      : await addProductToSupabase(formData.category, formData);

    if (result.success) {
      setShowForm(false);
      setEditingProduct(null);
      loadProducts();
    } else {
      alert('操作失败：' + result.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const activeCategoryName = categories.find(c => c.id === activeCategory)?.name || '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-white flex items-center justify-center">
        <p className="text-cyber-cyan font-mono text-xs animate-pulse">加载中...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-cyber-cyan/20">
          <div>
            <h1 className="text-3xl font-bold neon-text-cyan font-mono glitch-text">
              吃了么 · 管理后台
            </h1>
            <p className="text-cyber-cyan/60 font-mono text-xs mt-2 tracking-wider uppercase">
              [ Admin Panel v2.0 ]
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

        {/* Admin Tabs */}
        <nav className="flex flex-wrap gap-2 mb-6">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-mono text-xs border transition-all uppercase tracking-wider ${
                activeTab === tab.id
                  ? 'bg-cyber-cyan text-black border-cyber-cyan font-bold'
                  : 'border-cyber-cyan/30 text-cyber-cyan/70 hover:text-cyber-cyan hover:border-cyber-cyan bg-black/50'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="bg-black/20 border border-cyber-cyan/10 rounded p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold neon-text-cyan font-mono glitch-text">
                  商品管理
                </h2>
                <button
                  onClick={handleAdd}
                  className="cyber-button py-2 px-6 text-sm font-mono"
                >
                  + 添加商品
                </button>
              </div>

              {/* Category Tabs */}
              <nav className="flex flex-wrap gap-2 mb-4">
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

              <div className="text-cyber-cyan/40 font-mono text-xs mb-4">
                总计：{Object.values(products).reduce((sum, arr) => sum + arr.length, 0)} 个商品
              </div>

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
          )}

          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'spins' && <SpinRecords />}
          {activeTab === 'history' && <HistoryLogs />}
        </div>
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
