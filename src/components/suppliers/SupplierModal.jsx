'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SupplierModal({ isOpen, onClose, onSuccess, supplierToEdit, getAuthHeaders }) {
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    tax_number: '',
  });
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(supplierToEdit);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          name: supplierToEdit.name || '',
          contact_person: supplierToEdit.contact_person || '',
          phone: supplierToEdit.phone || '',
          email: supplierToEdit.email || '',
          address: supplierToEdit.address || '',
          tax_number: supplierToEdit.tax_number || '',
        });
      } else {
        setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', tax_number: '' });
      }
    }
  }, [isOpen, supplierToEdit, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      return toast.error('اسم المورد حقل إلزامي.');
    }

    setLoading(true);
    const toastId = toast.loading(isEditMode ? 'جاري تعديل المورد...' : 'جاري إضافة المورد...');

    const url = isEditMode ? `/api/suppliers/${supplierToEdit.id}` : '/api/suppliers';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const headers = getAuthHeaders();
      const response = await fetch(url, {
        method,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      toast.dismiss(toastId);

      if (data.success) {
        toast.success(isEditMode ? 'تم تعديل المورد بنجاح!' : 'تمت إضافة المورد بنجاح!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'فشل في حفظ بيانات المورد.');
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Supplier form submission error:', error);
      toast.error('حدث خطأ في الشبكة.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right">اسم المورد *</label><input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 text-right">مسؤول التواصل</label><input id="contact_person" name="contact_person" type="text" value={formData.contact_person} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-right">الهاتف</label><input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 text-right">البريد الإلكتروني</label><input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
          <div><label htmlFor="address" className="block text-sm font-medium text-gray-700 text-right">العنوان</label><textarea id="address" name="address" value={formData.address} onChange={handleChange} rows="2" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea></div>
          <div><label htmlFor="tax_number" className="block text-sm font-medium text-gray-700 text-right">الرقم الضريبي</label><input id="tax_number" name="tax_number" type="text" value={formData.tax_number} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="flex justify-end space-x-2 space-x-reverse pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">إلغاء</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">{loading ? 'جاري الحفظ...' : 'حفظ'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}