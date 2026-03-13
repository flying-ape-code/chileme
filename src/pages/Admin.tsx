import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  img: string;
  promo_url: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const categories = ['早餐', '午餐', '下午茶', '晚餐', '夜宵'];

function Admin() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    img: '',
    promo_url: '',
    category: '早餐'
  });

  // 权限检查
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 加载商品数据
  useEffect(() => {
    if (isAdmin) {
      loadProducts();
    }
  }, [selectedCategory, isAdmin]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', selectedCategory)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setError('加载商品失败：' + err.message);
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.img) {
      setError('请填写商品名称和图片 URL');
      return;
    }

    try {
      const { error } = await supabase.from('products').insert([
        {
          name: formData.name,
          img: formData.img,
          promo_url: formData.promo_url,
          category: formData.category
        }
      ]);

      if (error) throw error;
      
      setShowAddModal(false);
      setFormData({ name: '', img: '', promo_url: '', category: '早餐' });
      loadProducts();
    } catch (err: any) {
      setError('添加商品失败：' + err.message);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          img: editingProduct.img,
          promo_url: editingProduct.promo_url,
          category: editingProduct.category
        })
        .eq('id', editingProduct.id);

      if (error) throw error;
      
      setEditingProduct(null);
      loadProducts();
    } catch (err: any) {
      setError('更新商品失败：' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      loadProducts();
    } catch (err: any) {
      setError('删除商品失败：' + err.message);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">
              🔐 后台管理系统
            </h1>
            <p className="text-gray-400">
              欢迎，{user?.username} ({user?.role})
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              返回首页
            </button>
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded font-mono text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Add Product Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="mb-6 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
        >
          + 添加商品
        </button>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            暂无商品，点击上方按钮添加
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{product.name}</h3>
                    <p className="text-gray-400 text-sm">{product.category}</p>
                  </div>
                </div>
                
                {product.promo_url && (
                  <a
                    href={product.promo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-cyan-400 text-sm mb-4 hover:underline truncate"
                  >
                    🔗 {product.promo_url}
                  </a>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProduct({...product})}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6">添加商品</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">商品名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                    placeholder="输入商品名称"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">图片 URL</label>
                  <input
                    type="text"
                    value={formData.img}
                    onChange={(e) => setFormData({...formData, img: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                    placeholder="输入图片 URL"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">推广链接 (可选)</label>
                  <input
                    type="url"
                    value={formData.promo_url}
                    onChange={(e) => setFormData({...formData, promo_url: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                    placeholder="输入推广链接"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  添加
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6">编辑商品</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">商品名称</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">图片 URL</label>
                  <input
                    type="text"
                    value={editingProduct.img}
                    onChange={(e) => setEditingProduct({...editingProduct, img: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">推广链接</label>
                  <input
                    type="url"
                    value={editingProduct.promo_url}
                    onChange={(e) => setEditingProduct({...editingProduct, promo_url: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">分类</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleEditProduct}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
