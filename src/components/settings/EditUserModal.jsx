'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PERMISSIONS_CONFIG } from '@/config/permissions';

export default function EditUserModal({ isOpen, onClose, userToEdit, onUserUpdated, getAuthHeaders }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Optional: for changing password
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    if (userToEdit) {
      setFullName(userToEdit.full_name || '');
      setUsername(userToEdit.username || '');
      setPermissions(userToEdit.permissions || {});
      setPassword(''); // Reset password field on modal open
    }
  }, [userToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userToEdit) return;

    setLoading(true);
    const toastId = toast.loading('جاري تحديث المستخدم...');

    const payload = {
      id: userToEdit.id,
      full_name: fullName,
      username,
      permissions: permissions,
    };

    // Only include password if it's not empty
    if (password.trim() !== '') {
      payload.password = password;
    }

    try {
      const response = await fetch('/api/settings', {
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
        toast.success('تم تحديث المستخدم بنجاح!');
        onUserUpdated(data.user); // Update the parent component's state
        onClose(); // Close the modal
      } else {
        toast.error(data.error || 'فشل في تحديث المستخدم.');
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Edit user error:', error);
      toast.error('حدث خطأ في الشبكة.');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (module, action) => {
    setPermissions(prev => {
      const newPermissions = { ...prev };
      if (!newPermissions[module]) {
        newPermissions[module] = [];
      }

      if (newPermissions[module].includes(action)) {
        newPermissions[module] = newPermissions[module].filter(p => p !== action);
      } else {
        newPermissions[module].push(action);
      }
      return newPermissions;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">تعديل بيانات المستخدم</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editFullName" className="block text-sm font-medium text-gray-700 text-right">
              الاسم الكامل
            </label>
            <input
              id="editFullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
            />
          </div>
          <div>
            <label htmlFor="editUsername" className="block text-sm font-medium text-gray-700 text-right">
              اسم المستخدم
            </label>
            <input
              id="editUsername"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
            />
          </div>
          <div>
            <label htmlFor="editPassword" className="block text-sm font-medium text-gray-700 text-right">
              كلمة المرور (اختياري)
            </label>
            <input
              id="editPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="اتركه فارغاً لعدم التغيير"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
            />
          </div>
          {/* Permissions Section */}
          <div>
            <h3 className="text-md font-medium text-gray-800 text-right mb-2">الصلاحيات</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {Object.entries(PERMISSIONS_CONFIG).map(([module, config]) => (
                <div key={module} className="border border-gray-200 rounded-md p-3">
                  <p className="font-semibold text-gray-700 text-right">{config.name}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-right">
                    {Object.entries(config.actions).map(([action, actionName]) => (
                      <label key={action} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={permissions[module]?.includes(action) || false}
                          onChange={() => handlePermissionChange(module, action)}
                        />
                        <span className="text-sm text-gray-600">{actionName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">إلغاء</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}