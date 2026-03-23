import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  img: string;
  cpsLink: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

const categories = ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'];
const categoryNames: Record<string, string> = {
  'breakfast': '早餐',
  'lunch': '午餐',
  'afternoon-tea': '下午茶',
  'dinner': '晚餐',
  'night-snack': '夜宵'
};

function Admin() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    img: '',
    cpsLink: '',
    category: 'breakfast',
    priceMin: '',
    priceMax: '',
    rating: '',
    isActive: true,
    sortOrder: '0'
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
        .order('sort_order', { ascending: true })
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
          cpsLink: formData.cpsLink,
          category: formData.category,
          priceMin: formData.priceMin ? parseFloat(formData.priceMin) : null,
          priceMax: formData.priceMax ? parseFloat(formData.priceMax) : null,
          rating: formData.rating ? parseFloat(formData.rating) : 0,
          isActive: formData.isActive,
          sortOrder: parseInt(formData.sortOrder) || 0
        }
      ]);

      if (error) throw error;
      
      // 成功：先关闭模态框，再重置表单，最后刷新列表
      setShowAddModal(false);
      setFormData({ 
        name: '', 
        img: '', 
        cpsLink: '', 
        category: 'breakfast',
        priceMin: '',
        priceMax: '',
        rating: '',
        isActive: true,
        sortOrder: '0'
      });
      setError('');
      await loadProducts();
      alert('商品添加成功！');
    } catch (err: any) {
      setError('添加商品失败：' + err.message);
      console.error('Add product error:', err);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          img: formData.img,
          cpsLink: formData.cpsLink,
          category: formData.category,
          priceMin: formData.priceMin ? parseFloat(formData.priceMin) : null,
          priceMax: formData.priceMax ? parseFloat(formData.priceMax) : null,
          rating: formData.rating ? parseFloat(formData.rating) : 0,
          isActive: formData.isActive,
          sortOrder: parseInt(formData.sortOrder) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      setEditingProduct(null);
      setShowAddModal(false);
      setFormData({ 
        name: '', 
        img: '', 
        cpsLink: '', 
        category: 'breakfast',
        priceMin: '',
        priceMax: '',
        rating: '',
        isActive: true,
        sortOrder: '0'
      });
      setError('');
      await loadProducts();
      alert('商品更新成功！');
    } catch (err: any) {
      setError('更新商品失败：' + err.message);
      console.error('Update product error:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      loadProducts();
      alert('商品已删除');
    } catch (err: any) {
      setError('删除商品失败：' + err.message);
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
        .from('products')
        .delete()
        .in('id', Array.from(selectedProducts));
      
      if (error) throw error;
      
      setSelectedProducts(new Set());
      loadProducts();
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
        .from('products')
        .update({ category: newCategory })
        .in('id', Array.from(selectedProducts));
      
      if (error) throw error;

      setSelectedProducts(new Set());
      loadProducts();
      alert(`成功修改 ${selectedProducts.size} 个商品的分类`);
    } catch (err: any) {
      setError('批量修改分类失败：' + err.message);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${selectedCategory}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', '商品名称', '图片 URL', 'CPS 链接', '分类', '价格区间', '评分', '状态', '创建时间'];
    const rows = products.map(p => [
      p.id,
      `"${p.name}"`,
      `"${p.img}"`,
      `"${p.cpsLink || ''}"`,
      p.category,
      `"${p.priceMin || ''}-${p.priceMax || ''}"`,
      p.rating || '',
      p.isActive ? '上架' : '下架',
      p.createdAt
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

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      img: product.img,
      cpsLink: product.cpsLink || '',
      category: product.category,
      priceMin: product.priceMin?.toString() || '',
      priceMax: product.priceMax?.toString() || '',
      rating: product.rating?.toString() || '',
      isActive: product.isActive,
      sortOrder: product.sortOrder.toString()
    });
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      img: '',
      cpsLink: '',
      category: selectedCategory,
      priceMin: '',
      priceMax: '',
      rating: '',
      isActive: true,
      sortOrder: '0'
    });
    setShowAddModal(true);
  };

  if (!isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">后台管理 - 商品管理</h1>
              <a
                href="/admin/cps"
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
              >
                🎯 CPS 链接管理
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">管理员：{user?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button onClick={() => setError('')} className="ml-4 underline">关闭</button>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryNames[cat]}</option>
              ))}
            </select>
            <span className="text-gray-600">共 {products.length} 个商品</span>
          </div>

          <div className="flex gap-2">
            {selectedProducts.size > 0 && (
              <>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBatchChangeCategory(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  defaultValue=""
                >
                  <option value="" disabled>批量移动分类</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{categoryNames[cat]}</option>
                  ))}
                </select>
                <button
                  onClick={handleBatchDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  批量删除 ({selectedProducts.size})
                </button>
              </>
            )}
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              添加商品
            </button>
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              导出 JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              导出 CSV
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        )}

        {/* Products Table - 桌面端显示，移动端隐藏 */}
        {!isLoading && (
          <>
            {/* 桌面端表格视图 */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(new Set(products.map(p => p.id)));
                        } else {
                          setSelectedProducts(new Set());
                        }
                      }}
                      checked={selectedProducts.size === products.length && products.length > 0}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">图片</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPS 链接</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">价格</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">评分</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">排序</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        onChange={() => toggleProductSelection(product.id)}
                        checked={selectedProducts.has(product.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <img src={product.img} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3">
                      {product.cpsLink ? (
                        <a href={product.cpsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          查看链接
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">无</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.priceMin && product.priceMax ? `¥${product.priceMin} - ¥${product.priceMax}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.rating?.toFixed(1) || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.isActive ? '上架' : '下架'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      暂无商品数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>

            {/* 移动端卡片视图 */}
            <div className="md:hidden space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 border border-gray-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="mt-1 rounded border-gray-300"
                    />
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500">{categoryNames[product.category]}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.isActive ? '上架' : '下架'}
                        </span>
                        {product.rating && (
                          <span className="text-xs text-yellow-600">⭐ {product.rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm min-h-[44px]"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm min-h-[44px]"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  暂无商品数据
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal - 移动端优化 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto safe-area-bottom safe-area-top">
            <h2 className="text-lg sm:text-xl font-bold mb-4">{editingProduct ? '编辑商品' : '添加商品'}</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">商品名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[44px]"
                  placeholder="如：煎饼果子"
                  inputMode="text"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">分类 *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[44px]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{categoryNames[cat]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">图片 URL *</label>
                <input
                  type="url"
                  value={formData.img}
                  onChange={(e) => setFormData({...formData, img: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[44px]"
                  placeholder="https://..."
                  inputMode="url"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">CPS 推广链接</label>
                <input
                  type="url"
                  value={formData.cpsLink}
                  onChange={(e) => setFormData({...formData, cpsLink: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[44px]"
                  placeholder="https://..."
                  inputMode="url"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最低价格</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceMin}
                    onChange={(e) => setFormData({...formData, priceMin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最高价格</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceMax}
                    onChange={(e) => setFormData({...formData, priceMax: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">评分 (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="4.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序权重</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">上架销售</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-base min-h-[48px] min-w-[100px]"
              >
                取消
              </button>
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base min-h-[48px] min-w-[120px]"
              >
                {editingProduct ? '保存修改' : '添加商品'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
