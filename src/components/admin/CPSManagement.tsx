import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface CPSProduct {
  id: string;
  name: string;
  category: string;
  img: string;
  promoUrl: string | null;
  cpsLink: string | null;
  originalUrl?: string | null;
  cpsGeneratedAt?: string | null;
  clickCount?: number;
  isActive: boolean;
}

interface CPSManagementProps {
  onBack?: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  'breakfast': '早餐',
  'lunch': '午餐',
  'afternoon-tea': '下午茶',
  'dinner': '晚餐',
  'night-snack': '夜宵'
};

export default function CPSManagement({ onBack }: CPSManagementProps) {
  const [products, setProducts] = useState<CPSProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<CPSProduct | null>(null);
  const [editUrl, setEditUrl] = useState('');

  // 加载商品数据
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      setProducts(data || []);
    } catch (err: any) {
      setError('加载商品数据失败：' + err.message);
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤商品
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  // 统计信息
  const stats = {
    total: products.length,
    withCps: products.filter(p => (p.promoUrl || p.cpsLink) && (p.promoUrl || p.cpsLink)?.includes('u.meituan.com')).length,
    totalClicks: products.reduce((sum, p) => sum + (p.clickCount || 0), 0),
  };

  // 处理编辑
  const handleEdit = (product: CPSProduct) => {
    setEditingProduct(product);
    setEditUrl(product.promoUrl || product.cpsLink || '');
  };

  // 保存编辑
  const handleSave = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          promoUrl: editUrl,
          cpsLink: editUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id);

      if (error) {
        throw new Error(error.message);
      }

      // 更新本地状态
      setProducts(products.map(p => 
        p.id === editingProduct.id
          ? { ...p, promoUrl: editUrl, cpsLink: editUrl, updated_at: new Date().toISOString() }
          : p
      ));
      
      setEditingProduct(null);
      alert('CPS 链接已更新！');
    } catch (err: any) {
      setError('更新 CPS 链接失败：' + err.message);
    }
  };

  // 复制链接
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('链接已复制到剪贴板！');
    } catch (err) {
      alert('复制失败，请手动复制');
    }
  };

  // 重置为占位符链接
  const handleResetLink = async (product: CPSProduct) => {
    if (!confirm(`确定要重置 "${product.name}" 的 CPS 链接吗？`)) return;

    try {
      if (product.originalUrl) {
        // 重新生成占位符链接
        const timestamp = Date.now();
        const encodedUrl = encodeURIComponent(product.originalUrl);
        const hash = product.name.split('').reduce((acc: number, char: string) => {
          return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
        }, 0);
        const shortId = Math.abs(hash).toString(36).substring(0, 6);
        const newLink = `https://u.meituan.com/cps/shipinwaimai/${shortId}?url=${encodedUrl}&ch=473920&ts=${timestamp}`;
        
        const { error } = await supabase
          .from('products')
          .update({
            promoUrl: newLink,
            cpsLink: newLink,
            cpsGeneratedAt: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);

        if (error) {
          throw new Error(error.message);
        }

        setProducts(products.map(p => 
          p.id === product.id
            ? { ...p, promoUrl: newLink, cpsLink: newLink, cpsGeneratedAt: new Date().toISOString() }
            : p
        ));
        
        alert('CPS 链接已重置！');
      }
    } catch (err: any) {
      setError('重置 CPS 链接失败：' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载 CPS 数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-6">
      {/* 头部 */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                ← 返回
              </button>
            )}
            <h1 className="text-3xl font-bold text-gray-800">🎯 CPS 推广链接管理</h1>
          </div>
          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-md transition-colors"
          >
            🔄 刷新
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">总商品数</div>
            <div className="text-3xl font-bold text-orange-500">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">已生成 CPS 链接</div>
            <div className="text-3xl font-bold text-green-500">{stats.withCps}</div>
            <div className="text-xs text-gray-400 mt-1">
              覆盖率：{stats.total > 0 ? ((stats.withCps / stats.total) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">总点击次数</div>
            <div className="text-3xl font-bold text-blue-500">{stats.totalClicks}</div>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">分类筛选：</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">全部</option>
              <option value="breakfast">早餐</option>
              <option value="lunch">午餐</option>
              <option value="afternoon-tea">下午茶</option>
              <option value="dinner">晚餐</option>
              <option value="night-snack">夜宵</option>
            </select>
            <span className="text-sm text-gray-500">
              显示 {filteredProducts.length} 个商品
            </span>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
      </div>

      {/* 商品列表 */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPS 链接
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    点击数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    生成时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=商品';
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                        {CATEGORY_NAMES[product.category] || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 max-w-xs truncate" title={product.promoUrl || product.cpsLink || ''}>
                        {product.promoUrl || product.cpsLink || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.clickCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.cpsGeneratedAt
                        ? new Date(product.cpsGeneratedAt).toLocaleString('zh-CN')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(product.promoUrl || product.cpsLink || '')}
                          className="text-blue-600 hover:text-blue-900"
                          title="复制链接"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-green-600 hover:text-green-900"
                          title="编辑链接"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleResetLink(product)}
                          className="text-orange-600 hover:text-orange-900"
                          title="重置链接"
                        >
                          🔄
                        </button>
                        <a
                          href={product.promoUrl || product.cpsLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900"
                          title="测试链接"
                        >
                          🔗
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 编辑模态框 */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              编辑 CPS 链接 - {editingProduct.name}
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPS 推广链接
              </label>
              <textarea
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <div className="mb-2">
                  <strong>原始 URL：</strong>
                  <div className="text-xs break-all">{editingProduct.originalUrl || '-'}</div>
                </div>
                <div>
                  <strong>生成时间：</strong>
                  <div className="text-xs">
                    {editingProduct.cpsGeneratedAt
                      ? new Date(editingProduct.cpsGeneratedAt).toLocaleString('zh-CN')
                      : '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部说明 */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📝 使用说明</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ <strong>数据来源：</strong>所有商品数据从 Supabase products 表读取</li>
            <li>✏️ <strong>手动编辑：</strong>点击 ✏️ 按钮手动修改 CPS 链接</li>
            <li>📋 <strong>复制链接：</strong>点击 📋 按钮复制链接到剪贴板</li>
            <li>🔄 <strong>重置链接：</strong>点击 🔄 按钮重新生成占位符链接</li>
            <li>🔗 <strong>测试链接：</strong>点击 🔗 按钮在新窗口打开链接测试</li>
            <li>⚠️ <strong>注意：</strong>需要在美团联盟后台获取正式 API 凭证后替换占位符链接</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
