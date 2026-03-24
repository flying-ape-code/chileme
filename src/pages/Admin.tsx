import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  img: string;
  promo_url?: string | null;
  cps_link?: string | null;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const categories = ['全部', '早餐', '午餐', '下午茶', '晚餐', '夜宵'];
const categoryMap: Record<string, string> = {
  '全部': 'all',
  '早餐': 'breakfast',
  '午餐': 'lunch',
  '下午茶': 'afternoon-tea',
  '晚餐': 'dinner',
  '夜宵': 'night-snack'
};

function Admin() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    img: '',
    promo_url: '',
    category: 'breakfast'
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const loadProducts = async (page: number = 1, category: string = 'all') => {
    setIsLoading(true);
    setError('');
    try {
      let query = supabase.from('products').select('*', { count: 'exact' });
      if (category !== 'all') {
        query = query.eq('category', category);
      }
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.order('created_at', { ascending: false }).range(from, to);
      const { data, error, count } = await query;
      if (error) throw error;
      setProducts(Array.isArray(data) ? data : []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / pageSize));
      setCurrentPage(page);
    } catch (err: any) {
      console.error('加载商品失败:', err);
      setError(err.message);
      setProducts([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const categoryKey = categoryMap[category];
    loadProducts(1, categoryKey);
  };

  const handlePageChange = (page: number) => {
    const categoryKey = categoryMap[selectedCategory];
    loadProducts(page, categoryKey);
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.img) {
      setError('请填写商品名称和图片 URL');
      return;
    }
    try {
      const { error } = await supabase.from('products').insert([{
        name: formData.name,
        img: formData.img,
        promo_url: formData.promo_url || null,
        category: formData.category
      }]);
      if (error) throw error;
      setShowAddModal(false);
      setFormData({ name: '', img: '', promo_url: '', category: 'breakfast' });
      const categoryKey = categoryMap[selectedCategory];
      loadProducts(currentPage, categoryKey);
    } catch (err: any) {
      setError('添加失败：' + err.message);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;
    try {
      const { error } = await supabase.from('products').update({
        name: editingProduct.name,
        img: editingProduct.img,
        promo_url: editingProduct.promo_url,
        category: editingProduct.category
      }).eq('id', editingProduct.id);
      if (error) throw error;
      setEditingProduct(null);
      const categoryKey = categoryMap[selectedCategory];
      loadProducts(currentPage, categoryKey);
    } catch (err: any) {
      setError('更新失败：' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      const categoryKey = categoryMap[selectedCategory];
      loadProducts(currentPage, categoryKey);
    } catch (err: any) {
      setError('删除失败：' + err.message);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getCategoryName = (category: string) => {
    return Object.keys(categoryMap).find(k => categoryMap[k] === category) || category;
  };

  if (!isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">商品管理后台</h1>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">总计商品</p>
              <p className="text-3xl font-bold text-blue-600">{totalCount} 个</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">当前页</p>
              <p className="text-3xl font-bold text-green-600">{currentPage}/{totalPages || 1}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">错误</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">加载中...</div>
          ) : products.length === 0 && totalCount === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">暂无商品</div>
              <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">添加第一个商品</button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">当前分类无商品</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPS 链接</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img src={product.img} alt={product.name} className="w-12 h-12 rounded object-cover mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              {product.promo_url && (
                                <a href={product.promo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block max-w-xs">
                                  {product.promo_url.substring(0, 50)}...
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{getCategoryName(product.category)}</span>
                        </td>
                        <td className="px-6 py-4">
                          {product.cps_link ? (
                            <a href={product.cps_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">查看 CPS 链接</a>
                          ) : (
                            <span className="text-gray-400 text-sm">无 CPS 链接</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {product.is_active ? '激活' : '未激活'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(product.created_at).toLocaleDateString('zh-CN')}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingProduct(product)} className="text-blue-600 hover:text-blue-800 text-sm">编辑</button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800 text-sm">删除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 px-6 py-4 border-t">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">上一页</button>
                  {getPageNumbers().map(page => (
                    <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}>{page}</button>
                  ))}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">下一页</button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="mt-6">
          <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">+ 添加商品</button>
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">添加商品</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="输入商品名称" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
                <input type="url" value={formData.img} onChange={(e) => setFormData({...formData, img: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/image.jpg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">推广链接</label>
                <input type="url" value={formData.promo_url} onChange={(e) => setFormData({...formData, promo_url: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/promo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="breakfast">早餐</option>
                  <option value="lunch">午餐</option>
                  <option value="afternoon-tea">下午茶</option>
                  <option value="dinner">晚餐</option>
                  <option value="night-snack">夜宵</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddProduct} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">添加</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">取消</button>
            </div>
          </div>
        </div>
      )}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">编辑商品</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
                <input type="url" value={editingProduct.img} onChange={(e) => setEditingProduct({...editingProduct, img: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">推广链接</label>
                <input type="url" value={editingProduct.promo_url || ''} onChange={(e) => setEditingProduct({...editingProduct, promo_url: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="breakfast">早餐</option>
                  <option value="lunch">午餐</option>
                  <option value="afternoon-tea">下午茶</option>
                  <option value="dinner">晚餐</option>
                  <option value="night-snack">夜宵</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleEditProduct} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">保存</button>
              <button onClick={() => setEditingProduct(null)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
