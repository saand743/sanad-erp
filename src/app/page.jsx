'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUsers, FaDollarSign, FaShoppingCart, FaBoxOpen } from 'react-icons/fa';

// --- مكونات فرعية للوحة التحكم ---

const StatsCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full mr-4 rtl:ml-4 rtl:mr-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="h-24 bg-gray-200 rounded-lg"></div>
      <div className="h-24 bg-gray-200 rounded-lg"></div>
      <div className="h-24 bg-gray-200 rounded-lg"></div>
      <div className="h-24 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-80 bg-gray-200 rounded-lg"></div>
      <div className="h-80 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// --- المكون الرئيسي لصفحة لوحة التحكم ---

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('monthly');

  const getAuthHeaders = useCallback(() => {
    const token = Cookies.get('token');
    if (!token) return null;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers) {
        toast.error("غير مصرح لك بالوصول. يرجى تسجيل الدخول.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/dashboard/stats', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ time_period: timePeriod }),
        });
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          toast.error(result.error || 'فشل في جلب بيانات لوحة التحكم');
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error('خطأ في الشبكة عند جلب البيانات.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timePeriod, getAuthHeaders]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!data) {
    return <div className="p-6 text-center text-gray-500">لم يتم العثور على بيانات. قد يكون هناك خطأ في الاتصال بالخادم.</div>;
  }

  const { stats, charts, lists } = data;
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
        >
          <option value="weekly">أسبوعي</option>
          <option value="monthly">شهري</option>
          <option value="yearly">سنوي</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard icon={<FaDollarSign className="text-green-500 text-2xl" />} title="إجمالي المبيعات" value={`${Number(stats.total_sales).toLocaleString()} ج.م`} color="bg-green-100" />
        <StatsCard icon={<FaShoppingCart className="text-red-500 text-2xl" />} title="صافي الربح" value={`${Number(stats.net_profit).toLocaleString()} ج.م`} color="bg-red-100" />
        <StatsCard icon={<FaUsers className="text-blue-500 text-2xl" />} title="عملاء جدد" value={stats.new_customers} color="bg-blue-100" />
        <StatsCard icon={<FaBoxOpen className="text-yellow-500 text-2xl" />} title="إجمالي المشتريات" value={`${Number(stats.total_purchases).toLocaleString()} ج.م`} color="bg-yellow-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">المبيعات عبر الزمن</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.sales_over_time}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => new Intl.NumberFormat('ar-EG').format(value)} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} ج.م`} />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" name="المبيعات" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">أكثر المنتجات مبيعاً</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={charts.top_products} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="total_quantity_sold" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {charts.top_products.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} قطعة`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">أحدث المبيعات</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-right py-2 px-3">رقم الفاتورة</th><th className="text-right py-2 px-3">العميل</th><th className="text-right py-2 px-3">المبلغ</th></tr></thead>
              <tbody>{lists.recent_sales.map(sale => (<tr key={sale.id} className="border-t"><td className="py-2 px-3">{sale.invoice_number}</td><td className="py-2 px-3">{sale.customer_name}</td><td className="py-2 px-3">{Number(sale.total_amount).toLocaleString()} ج.م</td></tr>))}</tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">منتجات ذات مخزون منخفض</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-right py-2 px-3">المنتج</th><th className="text-right py-2 px-3">الكمية المتبقية</th></tr></thead>
              <tbody>{lists.low_stock_products.map(product => (<tr key={product.id} className="border-t"><td className="py-2 px-3">{product.name}</td><td className="py-2 px-3 text-red-500 font-bold">{product.current_stock}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}