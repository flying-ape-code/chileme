import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  img: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', name: '全部', emoji: '🍱' },
  { id: 'breakfast', name: '早餐', emoji: '🌅' },
  { id: 'lunch', name: '午餐', emoji: '🍜' },
  { id: 'afternoon-tea', name: '下午茶', emoji: '☕' },
  { id: 'dinner', name: '晚餐', emoji: '🍽️' },
  { id: 'night-snack', name: '夜宵', emoji: '🌙' }
];

const PAGE_SIZE = 20;

function Admin() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      console.log('[Admin Auth] Unauthorized access, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProducts(currentPage, selectedCategory);
    }
  }, [currentPage, selectedCategory, isAuthenticated, isAdmin]);

  const fetchProducts = async (page: number, category: string) => {
    console.log(`\n===== [Admin Fetch] Page: ${page}, Category: ${category} =====`);
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (category !== 'all') {
        console.log(`[Admin Query] Applying category filter: ${category}`);
        query = query.eq('category', category);
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE - 1;
      console.log(`[Admin Query] Pagination range: ${from} to ${to}`);
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      console.log('[Admin Query] Executing Supabase query...');
      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        console.error('[Admin Query Error]:', fetchError);
        throw new Error(fetchError.message);
      }

      console.log('[Admin Query Success] Received:', {
        itemCount: data?.length || 0,
        totalInDb: count,
        page: page
      });

      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('[Admin Fetch Failed]:', err);
      setError(err.message || '获取商品数据失败');
    } finally {
      setLoading(false);
      console.log('===== [Admin Fetch End] =====\n');
    }
  };

  const handlePageChange = (newPage: number) => {
    console.log(`[Admin UI] Changing page to: ${newPage}`);
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (catId: string) => {
    console.log(`[Admin UI] Changing category to: ${catId}`);
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-white p-4 sm:p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-cyber-cyan/30 pb-6">
          <div>
            <h1 className="text-3xl font-black text-cyber-cyan neon-text-cyan uppercase tracking-tighter">
              Control Panel // 商品管理
            </h1>
            <p className="text-gray-500 text-xs mt-1">[ Access Level: Administrator ]</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-cyber-pink/50 text-cyber-pink hover:bg-cyber-pink/10 transition-all text-sm uppercase"
          >
            返回终端
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 bg-black/40 border border-cyber-cyan/20 p-6 rounded-sm backdrop-blur-md">
            <p className="text-gray-500 text-xs uppercase mb-2">Total Inventory</p>
            <p className="text-4xl font-black text-cyber-cyan">{totalCount}</p>
            <p className="text-[10px] text-gray-600 mt-2">DATABASE: products_v1</p>
          </div>

          <div className="lg:col-span-3 bg-black/40 border border-cyber-cyan/20 p-6 rounded-sm backdrop-blur-md">
            <p className="text-gray-500 text-xs uppercase mb-4">Sector Filter // 分类筛选</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 text-xs border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyber-cyan text-black border-cyber-cyan shadow-[0_0_15px_rgba(0,247,255,0.5)]'
                      : 'border-cyber-cyan/30 text-cyber-cyan/60 hover:border-cyber-cyan hover:text-cyber-cyan'
                  }`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 mb-8 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold uppercase text-xs">System Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-black/60 border border-cyber-cyan/20 rounded-sm overflow-hidden mb-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-cyber-cyan/20 border-t-cyber-cyan rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-cyber-cyan text-xs animate-pulse">SYNCHRONIZING...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p>[ NO DATA FOUND IN CURRENT SECTOR ]</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-cyber-cyan/20 bg-cyber-cyan/5">
                    <th className="px-6 py-4 text-cyber-cyan font-bold uppercase tracking-wider text-xs">Preview</th>
                    <th className="px-6 py-4 text-cyber-cyan font-bold uppercase tracking-wider text-xs">Name</th>
                    <th className="px-6 py-4 text-cyber-cyan font-bold uppercase tracking-wider text-xs">Category</th>
                    <th className="px-6 py-4 text-cyber-cyan font-bold uppercase tracking-wider text-xs">Timestamp</th>
                    <th className="px-6 py-4 text-cyber-cyan font-bold uppercase tracking-wider text-xs text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-cyan/10">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-cyber-cyan/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 border border-cyber-cyan/30 p-0.5 group-hover:border-cyber-cyan transition-all">
                          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white group-hover:text-cyber-cyan transition-colors">{product.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1">ID: {product.id.substring(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 border border-gray-700 text-[10px] uppercase text-gray-400">
                          {CATEGORIES.find(c => c.id === product.category)?.name || product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                        {new Date(product.created_at).toLocaleString('zh-CN', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[10px] px-2 py-1 ${product.is_active ? 'text-green-400 border border-green-400/30' : 'text-gray-500 border border-gray-500/30'}`}>
                          {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-cyber-cyan/20">
            <p className="text-gray-500 text-xs">
              SHOWING <span className="text-cyber-cyan">{products.length}</span> OF <span className="text-cyber-cyan">{totalCount}</span> RECORDS
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 border border-cyber-cyan/30 text-cyber-cyan disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyber-cyan/10 transition-all"
              >
                ◀ PREV
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 text-xs border transition-all ${
                          currentPage === p
                            ? 'bg-cyber-cyan text-black border-cyber-cyan'
                            : 'border-cyber-cyan/30 text-cyber-cyan hover:border-cyber-cyan'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  } else if (p === currentPage - 2 || p === currentPage + 2) {
                    return <span key={p} className="text-cyber-cyan/30 px-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 border border-cyber-cyan/30 text-cyber-cyan disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyber-cyan/10 transition-all"
              >
                NEXT ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
