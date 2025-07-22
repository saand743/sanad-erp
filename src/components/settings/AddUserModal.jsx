'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function AddUserModal({ isOpen, onClose, onUserAdded, getAuthHeaders }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFullName('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('جاري إضافة المستخدم...');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          username,
          password,
          permissions: {}, // Default empty permissions
        }),
      });

      const data = await response.json();
      toast.dismiss(toastId);

      if (data.success) {
        toast.success('تمت إضافة المستخدم بنجاح!');
        onUserAdded(data.user); // Update the parent component's state
        resetForm();
        onClose(); // Close the modal
      } else {
        toast.error(data.error || 'فشل في إضافة المستخدم.');
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Add user error:', error);
      toast.error('حدث خطأ في الشبكة.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">إضافة مستخدم جديد</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 text-right">
              الاسم الكامل
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 text-right">
              اسم المستخدم
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-right">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
            />
          </div>
          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">إلغاء</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
              {loading ? 'جاري الحفظ...' : 'حفظ المستخدم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}