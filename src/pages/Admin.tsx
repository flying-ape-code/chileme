import React, { useState, useEffect } from 'react';
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

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);
  
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // 防御性检查：确保 data 是数组
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('加载商品失败:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 分页计算
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  
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
  
  const categories = ['all', 'breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'];
  const categoryNames: Record<string, string> = {
    all: '全部',
    breakfast: '早餐',
    lunch: '午餐',
    'afternoon-tea': '下午茶',
    dinner: '晚餐',
    'night-snack': '夜宵'
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">商品管理后台</h1>
        
        {/* 统计信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">总计商品</p>
              <p className="text-3xl font-bold text-blue-600">{totalProducts} 个</p>
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
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryNames[cat]}
              </button>
            ))}
          </div>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">加载失败</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {/* 商品列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">加载中...</div>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400">暂无商品</div>
            </div>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img src={product.img} alt={product.name} className="w-12 h-12 rounded object-cover mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              {product.promo_url && (
                                <a href={product.promo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                  {product.promo_url.substring(0, 50)}...
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {categoryNames[product.category] || product.category}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* 分页导航 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 px-6 py-4 border-t">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    上一页
                  </button>
                  
                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
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
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
      </div>
    </div>
  );
}
