'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function EditStockModal({ isOpen, onClose, product, onStockUpdated, getAuthHeaders }) {
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setStock(product.current_stock || 0);
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    const toastId = toast.loading('جاري تحديث المخزون...');

    // We send the full product object to the API to avoid issues with missing fields
    const payload = { ...product, current_stock: stock };

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      toast.dismiss(toastId);

      if (data.success) {
        toast.success('تم تحديث المخزون بنجاح!');
        onStockUpdated(data.product); // تحديث كمية المخزون في الصفحة الرئيسية
        onClose();
      } else {
        toast.error(data.error || 'فشل في تحديث المخزون.');
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Edit stock error:', error);
      toast.error('حدث خطأ في الشبكة.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">تعديل مخزون: {product.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 text-right">الكمية الحالية</label>
            <input id="stock" type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right" />
          </div>
          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">إلغاء</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}