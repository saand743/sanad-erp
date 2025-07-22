'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AssignUserModal({ isOpen, onClose, onSuccess, users, roles, getAuthHeaders }) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && users.length > 0) {
            const user = users.find(u => u.id === parseInt(selectedUserId, 10));
            const role = roles.find(r => r.name_ar === user?.role_name);
            setSelectedRoleId(role ? role.id : '');
        }
    }, [selectedUserId, users, roles, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUserId) {
            return toast.error('الرجاء اختيار مستخدم.');
        }
        setLoading(true);
        const toastId = toast.loading('جاري ربط المستخدم بالدور...');

        try {
            const headers = getAuthHeaders();
            const response = await fetch('/api/users/assign-role', {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUserId, roleId: selectedRoleId }),
            });
            const data = await response.json();
            toast.dismiss(toastId);

            if (data.success) {
                toast.success('تم ربط المستخدم بالدور بنجاح!');
                onSuccess();
                onClose();
            } else {
                toast.error(data.error || 'فشل في ربط المستخدم بالدور.');
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('حدث خطأ في الشبكة.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">ربط مستخدم بدور</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">المستخدم</label><select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="" disabled>-- اختر مستخدم --</option>{users.map(user => (<option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>))}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">الدور</label><select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">-- بدون دور --</option>{roles.filter(r => !r.is_system_role).map(role => (<option key={role.id} value={role.id}>{role.name_ar}</option>))}</select></div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-2 space-x-reverse">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">إلغاء</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400">{loading ? 'جاري الحفظ...' : 'حفظ'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}