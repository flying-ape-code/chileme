import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import * as adService from '../services/adService';

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

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  alt_text: string;
  is_enabled: boolean;
  priority: number;
  start_at?: string;
  end_at?: string;
  created_at?: string;
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

type TabType = 'products' | 'ads';

function Admin() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // 当前激活的标签页
  const [activeTab, setActiveTab] = useState<TabType>('products');
  
  // 商品数据状态
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 广告数据状态
  const [ads, setAds] = useState<Ad[]>([]);
  const [isAdsLoading, setIsAdsLoading] = useState(false);
  const [adsError, setAdsError] = useState('');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  
  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState('全部');
  
  // 商品模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    img: '',
    promo_url: '',
    category: 'breakfast'
  });
  
  // 广告模态框状态
  const [showAddAdModal, setShowAddAdModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [adFormData, setAdFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    alt_text: '',
    is_enabled: true,
    priority: 1,
    start_at: '',
    end_at: ''
  });

  // 权限检查
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }
    // 初始加载第一个分类
    loadProducts(1, 'all');
  }, []);
  
  // 加载广告数据
  const loadAds = async () => {
    setIsAdsLoading(true);
    setAdsError('');
    
    try {
      const allAds = await adService.fetchAllAds();
      setAds(allAds);
    } catch (err: any) {
      console.error('加载广告失败:', err);
      setAdsError(err.message);
      setAds([]);
    } finally {
      setIsAdsLoading(false);
    }
  };
  
  // 当切换到广告标签页时加载广告
  useEffect(() => {
    if (activeTab === 'ads') {
      loadAds();
    }
  }, [activeTab]);

  // 加载商品数据（服务端分页）
  const loadProducts = async (page: number, category: string) => {
    console.log('加载商品:', page, category);
    setIsLoading(true);
    setError('');
    
    try {
      // 构建查询
      let query = supabase
        .from('products')
        .select('*', { count: 'exact', head: false });
      
      // 分类筛选
      if (category !== 'all') {
        query = query.eq('category', category);
      }
      
      // 分页参数
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      console.log('分页范围:', from, to);
      
      // 应用分页和排序
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      // 执行查询
      const { data, error, count } = await query;
      
      console.log('查询结果:', data?.length, '总数:', count);
      
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

  // 分类变化
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const categoryKey = categoryMap[category];
    loadProducts(1, categoryKey);
  };

  // 页码变化
  const handlePageChange = (page: number) => {
    const categoryKey = categoryMap[selectedCategory];
    loadProducts(page, categoryKey);
  };

  // 添加商品
  const handleAddProduct = async () => {
    if (!productFormData.name || !productFormData.img) {
      setError('请填写商品名称和图片 URL');
      return;
    }

    try {
      const { error } = await supabase.from('products').insert([{
        name: productFormData.name,
        img: productFormData.img,
        promo_url: productFormData.promo_url || null,
        category: productFormData.category
      }]);

      if (error) throw error;

      setShowAddModal(false);
      setProductFormData({ name: '', img: '', promo_url: '', category: 'breakfast' });
      const categoryKey = categoryMap[selectedCategory];
      loadProducts(currentPage, categoryKey);
    } catch (err: any) {
      setError('添加失败：' + err.message);
    }
  };

  // 添加广告
  const handleAddAd = async () => {
    if (!adFormData.title || !adFormData.image_url || !adFormData.link_url) {
      setAdsError('请填写广告标题、图片 URL 和链接 URL');
      return;
    }

    try {
      const newAd = await adService.createAd({
        title: adFormData.title,
        image_url: adFormData.image_url,
        link_url: adFormData.link_url,
        alt_text: adFormData.alt_text || adFormData.title,
        is_enabled: adFormData.is_enabled,
        priority: adFormData.priority,
        start_at: adFormData.start_at || undefined,
        end_at: adFormData.end_at || undefined
      });

      if (!newAd) {
        setAdsError('创建广告失败');
        return;
      }

      setShowAddAdModal(false);
      setAdFormData({
        title: '',
        image_url: '',
        link_url: '',
        alt_text: '',
        is_enabled: true,
        priority: 1,
        start_at: '',
        end_at: ''
      });
      loadAds();
    } catch (err: any) {
      setAdsError('添加失败：' + err.message);
    }
  };
  
  // 编辑广告
  const handleEditAd = async () => {
    if (!editingAd) return;

    try {
      const updated = await adService.updateAd(editingAd.id, {
        title: editingAd.title,
        image_url: editingAd.image_url,
        link_url: editingAd.link_url,
        alt_text: editingAd.alt_text,
        is_enabled: editingAd.is_enabled,
        priority: editingAd.priority,
        start_at: editingAd.start_at,
        end_at: editingAd.end_at
      });

      if (!updated) {
        setAdsError('更新广告失败');
        return;
      }

      setEditingAd(null);
      loadAds();
    } catch (err: any) {
      setAdsError('更新失败：' + err.message);
    }
  };
  
  // 删除广告
  const handleDeleteAd = async (id: string) => {
    if (!confirm('确定要删除这个广告吗？')) return;

    try {
      const success = await adService.deleteAd(id);
      if (!success) {
        setAdsError('删除广告失败');
        return;
      }
      loadAds();
    } catch (err: any) {
      setAdsError('删除失败：' + err.message);
    }
  };
  // 编辑商品
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
      const categoryKey = categoryMap[selectedCategory];
      loadProducts(currentPage, categoryKey);
    } catch (err: any) {
      setError('更新失败：' + err.message);
    }
  };

  // 删除商品
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

  // 页码生成
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">管理后台</h1>
        
        {/* 标签页切换 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'products'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📦 商品管理
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'ads'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📢 广告管理
            </button>
          </div>
        </div>
        
        {/* 商品管理标签页 */}
        {activeTab === 'products' && (
          <>
        {/* 统计信息 */}
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
        
        {/* 分类筛选 */}
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
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">错误</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {/* 商品列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">加载中...</div>
          ) : products.length === 0 && totalCount === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">暂无商品</div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                添加第一个商品
              </button>
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
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {getCategoryName(product.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {product.cps_link ? (
                            <a href={product.cps_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              查看 CPS 链接
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">无 CPS 链接</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {product.is_active ? '激活' : '未激活'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(product.created_at).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* 分页导航 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 px-6 py-4 border-t">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    上一页
                  </button>
                  
                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded border ${
                        currentPage === page
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* 添加商品按钮 */}
        <div className="mt-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            + 添加商品
          </button>
        </div>
          </>
        )}
        
        {/* 广告管理标签页 */}
        {activeTab === 'ads' && (
          <>
            {/* 统计信息 */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">总计广告</p>
                  <p className="text-3xl font-bold text-blue-600">{ads.length} 个</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">启用中</p>
                  <p className="text-3xl font-bold text-green-600">{ads.filter(ad => ad.is_enabled).length} 个</p>
                </div>
              </div>
            </div>
            
            {/* 错误提示 */}
            {adsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="font-medium">错误</p>
                <p className="text-sm">{adsError}</p>
              </div>
            )}
            
            {/* 广告列表 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {isAdsLoading ? (
                <div className="text-center py-12 text-gray-400">加载中...</div>
              ) : ads.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">暂无广告</div>
                  <button
                    onClick={() => setShowAddAdModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    添加第一个广告
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">广告</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">优先级</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">有效期</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ads.map(ad => (
                        <tr key={ad.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <img src={ad.image_url} alt={ad.alt_text} className="w-16 h-10 rounded object-cover mr-3" />
                              <div>
                                <p className="font-medium text-gray-900">{ad.title}</p>
                                <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block max-w-xs">
                                  {ad.link_url.substring(0, 50)}...
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              ad.priority >= 5 ? 'bg-red-100 text-red-700' :
                              ad.priority >= 3 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              P{ad.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {ad.start_at && ad.end_at ? (
                              <div>
                                <div>{new Date(ad.start_at).toLocaleDateString('zh-CN')}</div>
                                <div>至 {new Date(ad.end_at).toLocaleDateString('zh-CN')}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">无限制</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              ad.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {ad.is_enabled ? '启用' : '禁用'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingAd(ad)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => handleDeleteAd(ad.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* 添加广告按钮 */}
            <div className="mt-6">
              <button
                onClick={() => setShowAddAdModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                + 添加广告
              </button>
            </div>
          </>
        )}
      </div>

      {/* 添加商品模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">添加商品</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                <input
                  type="text"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="输入商品名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
                <input
                  type="url"
                  value={productFormData.img}
                  onChange={(e) => setProductFormData({...productFormData, img: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">推广链接</label>
                <input
                  type="url"
                  value={productFormData.promo_url}
                  onChange={(e) => setProductFormData({...productFormData, promo_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/promo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={productFormData.category}
                  onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="breakfast">早餐</option>
                  <option value="lunch">午餐</option>
                  <option value="afternoon-tea">下午茶</option>
                  <option value="dinner">晚餐</option>
                  <option value="night-snack">夜宵</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddProduct}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                添加
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑商品模态框 */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">编辑商品</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
                <input
                  type="url"
                  value={editingProduct.img}
                  onChange={(e) => setEditingProduct({...editingProduct, img: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">推广链接</label>
                <input
                  type="url"
                  value={editingProduct.promo_url || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, promo_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="breakfast">早餐</option>
                  <option value="lunch">午餐</option>
                  <option value="afternoon-tea">下午茶</option>
                  <option value="dinner">晚餐</option>
                  <option value="night-snack">夜宵</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditProduct}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 添加广告模态框 */}
      {showAddAdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">添加广告</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">广告标题</label>
                <input
                  type="text"
                  value={adFormData.title}
                  onChange={(e) => setAdFormData({...adFormData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：双十一大促"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
                <input
                  type="url"
                  value={adFormData.image_url}
                  onChange={(e) => setAdFormData({...adFormData, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">跳转链接</label>
                <input
                  type="url"
                  value={adFormData.link_url}
                  onChange={(e) => setAdFormData({...adFormData, link_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/landing"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">替代文本</label>
                <input
                  type="text"
                  value={adFormData.alt_text}
                  onChange={(e) => setAdFormData({...adFormData, alt_text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="图片无法显示时的替代文本"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <input
                  type="number"
                  value={adFormData.priority}
                  onChange={(e) => setAdFormData({...adFormData, priority: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-gray-500 mt-1">数字越大优先级越高，1-10</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <input
                  type="datetime-local"
                  value={adFormData.start_at}
                  onChange={(e) => setAdFormData({...adFormData, start_at: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">留空表示立即生效</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input
                  type="datetime-local"
                  value={adFormData.end_at}
                  onChange={(e) => setAdFormData({...adFormData, end_at: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">留空表示永不过期</p>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_enabled"
                  checked={adFormData.is_enabled}
                  onChange={(e) => setAdFormData({...adFormData, is_enabled: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_enabled" className="text-sm font-medium text-gray-700">启用广告</label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddAd}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                添加
              </button>
              <button
                onClick={() => setShowAddAdModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 编辑广告模态框 */}
      {editingAd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">编辑广告</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">广告标题</label>
                <input
                  type="text"
                  value={editingAd.title}
                  onChange={(e) => setEditingAd({...editingAd, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
                <input
                  type="url"
                  value={editingAd.image_url}
                  onChange={(e) => setEditingAd({...editingAd, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">跳转链接</label>
                <input
                  type="url"
                  value={editingAd.link_url}
                  onChange={(e) => setEditingAd({...editingAd, link_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">替代文本</label>
                <input
                  type="text"
                  value={editingAd.alt_text}
                  onChange={(e) => setEditingAd({...editingAd, alt_text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <input
                  type="number"
                  value={editingAd.priority}
                  onChange={(e) => setEditingAd({...editingAd, priority: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <input
                  type="datetime-local"
                  value={editingAd.start_at ? editingAd.start_at.slice(0, 16) : ''}
                  onChange={(e) => setEditingAd({...editingAd, start_at: e.target.value || undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input
                  type="datetime-local"
                  value={editingAd.end_at ? editingAd.end_at.slice(0, 16) : ''}
                  onChange={(e) => setEditingAd({...editingAd, end_at: e.target.value || undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_is_enabled"
                  checked={editingAd.is_enabled}
                  onChange={(e) => setEditingAd({...editingAd, is_enabled: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="edit_is_enabled" className="text-sm font-medium text-gray-700">启用广告</label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditAd}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存
              </button>
              <button
                onClick={() => setEditingAd(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
