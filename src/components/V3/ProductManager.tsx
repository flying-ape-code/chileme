// V3.0 ProductManager 商品管理组件
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  cpsLink?: string;
  status: 'active' | 'inactive';
  image?: string;
}

const mockProducts: Product[] = [
  { id: '1', name: '麦当劳巨无霸套餐', price: 29.9, originalPrice: 39.9, category: '快餐', cpsLink: 'https://...', status: 'active' },
  { id: '2', name: '肯德基香辣鸡腿堡', price: 19.9, category: '快餐', status: 'active' },
  { id: '3', name: '星巴克中杯拿铁', price: 27, originalPrice: 33, category: '饮品', cpsLink: 'https://...', status: 'inactive' },
];

export const ProductManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProducts = mockProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const categories = ['all', '快餐', '饮品', '披萨', '小吃', '甜品'];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">商品管理</h1>
            </div>
            <Button variant="primary">添加商品</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 筛选栏 */}
        <Card className="mb-6">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="搜索商品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={categories.map(c => ({ value: c, label: c === 'all' ? '全部分类' : c }))}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'active', label: '上架' },
                  { value: 'inactive', label: '下架' },
                ]}
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">批量导入</Button>
                <Button variant="outline" className="flex-1">导出数据</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">商品列表 ({filteredProducts.length})</h3>
              <div className="text-sm text-gray-500">
                共 {mockProducts.length} 个商品
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">商品信息</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">分类</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">价格</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">CPS 链接</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">ID: {product.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#FF6B35]">¥{product.price.toFixed(2)}</div>
                        {product.originalPrice && (
                          <div className="text-xs text-gray-400 line-through">¥{product.originalPrice.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {product.cpsLink ? (
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            已生成
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">未生成</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          product.status === 'active' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.status === 'active' ? '上架' : '下架'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">编辑</Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">删除</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProductManager;
