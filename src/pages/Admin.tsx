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
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const [selectedCategory, setSelectedCategory] = useState('全部');

  useEffect(() => {
    console.log('===== [Admin Debug] =====');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isAdmin:', isAdmin);
    
    if (!isAuthenticated || !isAdmin) {
      console.log('未授权，跳转到登录页');
      navigate('/login');
      return;
    }
    
    console.log('开始加载商品');
    loadProducts(1, 'all');
  }, []);

  const loadProducts = async (page: number, category: string) => {
    console.log('\n===== [loadProducts] =====');
    console.log('参数:', { page, category, pageSize });
    
    setIsLoading(true);
    setError('');
    
    try {
      // 构建查询
      let query = supabase
        .from('products')
        .select('*', { count: 'exact', head: false });
      
      console.log('初始查询:', query);
      
      // 分类筛选
      if (category !== 'all') {
        console.log('添加分类筛选:', category);
        query = query.eq('category', category);
      }
      
      // 分页参数
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      console.log('分页范围:', { from, to });
      
      // 应用分页和排序
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      console.log('执行查询...');
      
      // 执行查询
      const { data, error, count } = await query;
      
      console.log('查询结果:', {
        dataLength: data?.length,
        count,
        error: error?.message,
        firstItem: data?.[0]?.name,
        lastItem: data?.[data.length - 1]?.name
      });
      
      if (error) {
        console.error('查询错误:', error);
        throw error;
      }
      
      setProducts(Array.isArray(data) ? data : []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / pageSize));
      setCurrentPage(page);
      
      console.log('状态已更新:', {
        products: data?.length,
        totalCount: count,
        totalPages: Math.ceil((count || 0) / pageSize)
      });
      
    } catch (err: any) {
      console.error('[loadProducts Error]:', err);
      setError(err.message);
      setProducts([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
      console.log('===== [loadProducts End] =====\n');
    }
  };

  const handleCategoryChange = (category: string) => {
    console.log('[handleCategoryChange]:', category);
    setSelectedCategory(category);
    const categoryKey = categoryMap[category];
    loadProducts(1, categoryKey);
  };

  const handlePageChange = (page: number) => {
    console.log('[handlePageChange]:', page);
    const categoryKey = categoryMap[selectedCategory];
    loadProducts(page, categoryKey);
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
              <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">返回首页</button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">当前分类无商品</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
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
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(product.created_at).toLocaleDateString('zh-CN')}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800 text-sm">删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 px-6 py-4 border-t">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded border disabled:opacity-50">上一页</button>
              {getPageNumbers().map(page => (
                <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-blue-500 text-white' : ''}`}>{page}</button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded border disabled:opacity-50">下一页</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
