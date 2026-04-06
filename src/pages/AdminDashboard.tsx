// V3.0 AdminDashboard 管理后台首页
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/V3/Card';
import { Button } from '../components/V3/Button';

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const statCards: StatCard[] = [
  { title: '总商品数', value: 693, change: 12, icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>, color: 'bg-blue-500' },
  { title: '今日订单', value: 156, change: 8.5, icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, color: 'bg-green-500' },
  { title: 'CPS 点击', value: 1247, change: 23, icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, color: 'bg-purple-500' },
  { title: '预估收益', value: '¥2,847', change: 15.3, icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'bg-orange-500' },
];

export const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">查看前台</Button>
              <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-medium">A</div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 时间范围选择 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">数据概览</h2>
          <div className="flex gap-2">
            <Button variant={timeRange === 'day' ? 'primary' : 'outline'} size="sm" onClick={() => setTimeRange('day')}>今日</Button>
            <Button variant={timeRange === 'week' ? 'primary' : 'outline'} size="sm" onClick={() => setTimeRange('week')}>本周</Button>
            <Button variant={timeRange === 'month' ? 'primary' : 'outline'} size="sm" onClick={() => setTimeRange('month')}>本月</Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-sm mt-1 ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                    </p>
                  )}
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 快捷操作 */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="font-semibold text-gray-900">快捷操作</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary">添加商品</Button>
              <Button variant="outline">批量导入</Button>
              <Button variant="outline">生成 CPS 链接</Button>
              <Button variant="outline">导出数据</Button>
            </div>
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">最近活动</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: '添加了新商品', item: '麦当劳巨无霸套餐', time: '5 分钟前' },
                { action: '更新了 CPS 链接', item: '肯德基香辣鸡腿堡', time: '12 分钟前' },
                { action: '删除了商品', item: '星巴克中杯拿铁', time: '1 小时前' },
                { action: '批量导入', item: '25 个商品', time: '2 小时前' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                    <span className="text-sm text-gray-500 ml-2">{activity.item}</span>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
