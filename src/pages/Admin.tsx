import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Meal {
  id: string;
  name: string;
  image_url: string;
  cps_link: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const categories = ['早餐', '午餐', '下午茶', '晚餐', '夜宵'];

function Admin() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Meal | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

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
      loadMeals();
    }
  }, [selectedCategory, isAdmin]);

  const loadMeals = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('category', selectedCategory)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (err: any) {
      setError('加载商品失败：' + err.message);
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeal = async () => {
    if (!formData.name || !formData.img) {
      setError('请填写商品名称和图片 URL');
      return;
    }

    try {
      const { error } = await supabase.from('meals').insert([
        {
          name: formData.name,
          image_url: formData.img,
          cps_link: formData.promo_url,
          category: formData.category
        }
      ]);

      if (error) throw error;
      
      // 成功：先关闭模态框，再重置表单，最后刷新列表
      setShowAddModal(false);
      setFormData({ name: '', img: '', promo_url: '', category: '早餐' });
      setError(''); // 清除之前的错误
      await loadMeals(); // 等待刷新完成
      alert('商品添加成功！');
    } catch (err: any) {
      setError('添加商品失败：' + err.message);
      console.error('Add product error:', err);
    }
  };


  const handleBatchDelete = async () => {
    if (selectedProducts.size === 0) {
      setError('请先选择要删除的商品');
      return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedProducts.size} 个商品吗？`)) return;

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .in('id', Array.from(selectedProducts));
      
      if (error) throw error;
      
      setSelectedProducts(new Set());
      loadMeals();
      alert(`成功删除 ${selectedProducts.size} 个商品`);
    } catch (err: any) {
      setError('批量删除失败：' + err.message);
    }
  };

  const handleBatchChangeCategory = async (newCategory: string) => {
    if (selectedProducts.size === 0) {
      setError('请先选择要修改分类的商品');
      return;
    }

    try {
      const { error } = await supabase
        .from('meals')
        .update({ category: newCategory })
        .in('id', Array.from(selectedProducts));
      
      if (error) throw error;
      
      setSelectedProducts(new Set());
      loadMeals();
      alert(`成功修改 ${selectedProducts.size} 个商品的分类`);
    } catch (err: any) {
      setError('批量修改分类失败：' + err.message);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(meals, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${selectedCategory}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', '商品名称', '图片 URL', '推广链接', '分类', '创建时间'];
    const rows = products.map(p => [
      p.id,
      `"${p.name}"`,
      `"${p.image_url}"`,
      `"${p.cps_link || ''}"`,
      p.category,
      p.created_at
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${selectedCategory}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleProductSelection = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleEditMeal = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('meals')
        .update({
          name: editingProduct.name,
          img: editingProduct.img,
          promo_url: editingProduct.promo_url,
          category: editingProduct.category
        })
        .eq('id', editingProduct.id);

      if (error) throw error;
      
      setEditingProduct(null);
      // loadMeals moved above
    } catch (err: any) {
      setError('更新商品失败：' + err.message);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    try {
      const { error } = await supabase.from('meals').delete().eq('id', id);
      if (error) throw error;
      // loadMeals moved above
    } catch (err: any) {
      setError('删除商品失败：' + err.message);
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  // 权限检查
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">请先登录</div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">无权访问</div>
          <div className="text-gray-400 mb-4">需要管理员权限</div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
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

        {/* Batch Actions */}
        {selectedProducts.size > 0 && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-cyan-400 font-bold">
                已选择 {selectedProducts.size} 个商品
              </span>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                批量删除
              </button>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBatchChangeCategory(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded text-sm"
                defaultValue=""
              >
                <option value="" disabled>批量修改分类...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                取消选择
              </button>
            </div>
          </div>
        )}

        {/* Export Actions */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            📥 导出 JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            📥 导出 CSV
          </button>
        </div>

        {/* Add Product Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="mb-6 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
        >
          + 添加商品
        </button>

        {/* Select All */}
        {products.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedProducts.size === products.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded"
            />
            <span className="text-gray-400 text-sm">全选 / 取消全选</span>
          </div>
        )}

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
                className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${
                  selectedProducts.has(product.id) ? 'border-cyan-500 border-2' : ''
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="w-4 h-4 rounded mt-1"
                  />
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
                    onClick={() => handleDeleteMeal(product.id)}
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
                  onClick={handleAddMeal}
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
                  onClick={handleEditMeal}
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
