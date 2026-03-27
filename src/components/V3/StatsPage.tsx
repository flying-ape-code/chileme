// V3.0 StatsPage 数据统计页面
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './Card';
import { Button } from './Button';
import { Select } from './Select';

export const StatsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const chartData = [
    { date: '03-01', orders: 45, revenue: 1200 },
    { date: '03-05', orders: 52, revenue: 1450 },
    { date: '03-10', orders: 38, revenue: 980 },
    { date: '03-15', orders: 67, revenue: 2100 },
    { date: '03-20', orders: 71, revenue: 2350 },
    { date: '03-25', orders: 58, revenue: 1780 },
    { date: '03-27', orders: 43, revenue: 1320 },
  ];

  const maxRevenue = Math.max(...chartData.map(d => d.revenue));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">数据统计</h1>
            </div>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              options={[
                { value: 'week', label: '最近 7 天' },
                { value: 'month', label: '最近 30 天' },
                { value: 'year', label: '最近 1 年' },
              ]}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-gray-500">总订单数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">1,247</p>
            <p className="text-sm text-green-600 mt-1">↑ 12.5% 较上月</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">总收益</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">¥28,450</p>
            <p className="text-sm text-green-600 mt-1">↑ 18.3% 较上月</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">CPS 点击</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">8,934</p>
            <p className="text-sm text-green-600 mt-1">↑ 23.1% 较上月</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">转化率</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">13.9%</p>
            <p className="text-sm text-red-600 mt-1">↓ 2.1% 较上月</p>
          </Card>
        </div>

        {/* 收益图表 */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="font-semibold text-gray-900">收益趋势</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {chartData.map((data) => (
                <div key={data.date} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-[#FF6B35] to-[#FF8C61] rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500">{data.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 分类统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">品类分布</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: '快餐', value: 45, color: 'bg-blue-500' },
                  { name: '饮品', value: 28, color: 'bg-green-500' },
                  { name: '披萨', value: 15, color: 'bg-purple-500' },
                  { name: '小吃', value: 8, color: 'bg-yellow-500' },
                  { name: '甜品', value: 4, color: 'bg-pink-500' },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-500">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">TOP 商品</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: '麦当劳巨无霸套餐', orders: 234, revenue: 6997 },
                  { name: '肯德基香辣鸡腿堡', orders: 189, revenue: 3761 },
                  { name: '星巴克中杯拿铁', orders: 156, revenue: 4212 },
                  { name: '必胜客超级至尊', orders: 98, revenue: 8722 },
                ].map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.orders} 单</p>
                    </div>
                    <div className="text-sm font-medium text-[#FF6B35]">
                      ¥{item.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StatsPage;
