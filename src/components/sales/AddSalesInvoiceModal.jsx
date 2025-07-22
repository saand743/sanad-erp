'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';

export default function AddSalesInvoiceModal({ isOpen, onClose, onInvoiceAdded, getAuthHeaders }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // جلب بيانات العملاء والمنتجات عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
          const [customersRes, productsRes] = await Promise.all([
            fetch('/api/customers?all=true', { headers }),
            fetch('/api/products?all=true', { headers }),
          ]);
          const customersData = await customersRes.json();
          const productsData = await productsRes.json();

          if (customersData.success) setCustomers(customersData.customers);
          if (productsData.success) setProducts(productsData.products);
        } catch (error) {
          toast.error('فشل في جلب بيانات العملاء والمنتجات.');
          console.error(error);
        }
      };
      fetchData();
    }
  }, [isOpen, getAuthHeaders]);

  const handleAddItem = (product) => {
    if (invoiceItems.some(item => item.product_id === product.id)) {
      toast.error('المنتج مضاف بالفعل.');
      return;
    }
    const newItem = {
      product_id: product.id,
      name: product.name,
      quantity: 1,
      unit_price: product.sale_price,
      total_price: product.sale_price,
      stock: product.current_stock,
    };
    setInvoiceItems([...invoiceItems, newItem]);
    setProductSearch('');
  };

  const handleQuantityChange = (productId, quantity) => {
    setInvoiceItems(items =>
      items.map(item => {
        if (item.product_id === productId) {
          const newQuantity = Math.max(1, Number(quantity));
          if (newQuantity > item.stock) {
            toast.error(`الكمية المطلوبة (${newQuantity}) أكبر من المخزون المتاح (${item.stock})`);
            return { ...item, quantity: item.stock, total_price: item.stock * item.unit_price };
          }
          return { ...item, quantity: newQuantity, total_price: newQuantity * item.unit_price };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId) => {
    setInvoiceItems(items => items.filter(item => item.product_id !== productId));
  };

  const totalAmount = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + item.total_price, 0);
  }, [invoiceItems]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    return products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5);
  }, [productSearch, products]);

  const resetForm = () => {
    setSelectedCustomerId('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setInvoiceItems([]);
    setProductSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) return toast.error('يرجى اختيار عميل.');
    if (invoiceItems.length === 0) return toast.error('يرجى إضافة منتجات إلى الفاتورة.');

    setLoading(true);
    const toastId = toast.loading('جاري إنشاء الفاتورة...');

    const payload = {
      customer_id: selectedCustomerId,
      invoice_date: invoiceDate,
      items: invoiceItems.map(({ product_id, quantity, unit_price, total_price }) => ({
        product_id, quantity, unit_price, total_price,
      })),
      total_amount: totalAmount,
    };

    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      toast.dismiss(toastId);

      if (data.success) {
        toast.success('تم إنشاء الفاتورة بنجاح!');
        resetForm();
        onInvoiceAdded(data.invoice); // تمرير الفاتورة الجديدة
        onClose();
      } else {
        toast.error(data.error || 'فشل في إنشاء الفاتورة.');
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Create invoice error:', error);
      toast.error('حدث خطأ في الشبكة.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">فاتورة مبيعات جديدة</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 text-right">العميل</label>
              <select id="customer" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right">
                <option value="">-- اختر العميل --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 text-right">تاريخ الفاتورة</label>
              <input id="invoiceDate" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right" />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="productSearch" className="block text-sm font-medium text-gray-700 text-right">إضافة منتج</label>
            <input id="productSearch" type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="ابحث عن منتج بالاسم..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right" />
            {filteredProducts.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto">{filteredProducts.map(p => (<li key={p.id} onClick={() => handleAddItem(p)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-right">{p.name} <span className          <div className="relative">
            <label htmlFor="productSearch" className="block text-sm font-medium text-gray-700 text-right">إضافة منتج</label>
            <input id="productSearch" type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="ابحث عن منتج بالاسم..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right" />
            {filteredProducts.length > 0 &&
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto">{filteredProducts.map(p => (<li key={p.id} onClick={() => handleAddItem(p)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-right">{p.name} <span className="text-xs text-gray-500">(المخزون: {p.current_stock})</span></li>))}</ul>}
          </div>

          {/* جدول بنود الفاتورة */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-24">الكمية</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">سعر الوحدة</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">الإجمالي</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">حذف</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoiceItems.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-gray-500">لم يتم إضافة منتجات بعد.</td></tr>
                ) : (
                  invoiceItems.map(item => (
                    <tr key={item.product_id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.product_id, e.target.value)} min="1" max={item.stock} className="w-20 border border-gray-300 rounded-md px-2 py-1 text-center" />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{Number(item.unit_price).toLocaleString()} ج.م</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{Number(item.total_price).toLocaleString()} ج.م</td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <button type="button" onClick={() => handleRemoveItem(item.product_id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6"><div className="text-xl font-bold text-gray-800">الإجمالي: {Number(totalAmount).toLocaleString()} ج.م</div></div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">إلغاء</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">{loading ? 'جاري الحفظ...' : 'حفظ الفاتورة'}</button>
          </div>
        </form>
      </div>
    </div>

="text-xs text-gray-500">(المخزون: