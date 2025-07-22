'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { availablePermissions } from '@/lib/permissions';

export default function RoleModal({ isOpen, onClose, onSuccess, roleToEdit, getAuthHeaders }) {
    const [formData, setFormData] = useState({ name: '', name_ar: '', description: '', permissions: {} });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const isEditMode = Boolean(roleToEdit);

    useEffect(() => {
        if (isOpen) {
            setActiveTab('basic');
            if (isEditMode) {
                setFormData({
                    name: roleToEdit.name || '',
                    name_ar: roleToEdit.name_ar || '',
                    description: roleToEdit.description || '',
                    permissions: roleToEdit.permissions || {},
                });
            } else {
                setFormData({ name: '', name_ar: '', description: '', permissions: {} });
            }
        }
    }, [isOpen, roleToEdit, isEditMode]);

    const handlePermissionChange = (module, action, value) => {
        setFormData(prev => {
            const newPermissions = { ...prev.permissions };
            if (!newPermissions[module]) {
                newPermissions[module] = {};
            }
            newPermissions[module][action] = value;
            // Clean up module if no permissions are true
            if (Object.values(newPermissions[module]).every(v => !v)) {
                delete newPermissions[module];
            }
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleModuleToggle = (module, moduleActions) => {
        const allSelected = Object.keys(moduleActions).every(action => formData.permissions[module]?.[action]);
        let newPermissions = { ...formData.permissions };

        if (allSelected) {
            delete newPermissions[module];
        } else {
            newPermissions[module] = {};
            Object.keys(moduleActions).forEach(action => {
                newPermissions[module][action] = true;
            });
        }
        setFormData(prev => ({ ...prev, permissions: newPermissions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading(isEditMode ? 'جاري تعديل الدور...' : 'جاري إنشاء الدور...');

        const url = isEditMode ? `/api/roles/${roleToEdit.id}` : '/api/roles';
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
                toast.success(isEditMode ? 'تم تعديل الدور بنجاح!' : 'تم إنشاء الدور بنجاح!');
                onSuccess();
                onClose();
            } else {
                toast.error(data.error || 'فشل في حفظ الدور.');
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'تعديل الدور' : 'إنشاء دور جديد'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>

                <div className="border-b"><nav className="flex space-x-8 space-x-reverse px-6"><button onClick={() => setActiveTab('basic')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'basic' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>المعلومات الأساسية</button><button onClick={() => setActiveTab('permissions')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'permissions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>الصلاحيات</button></nav></div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                    <div className="p-6">
                        {activeTab === 'basic' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">اسم الدور (عربي) *</label><input type="text" value={formData.name_ar} onChange={(e) => setFormData(p => ({ ...p, name_ar: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">اسم الدور (إنجليزي) *</label><input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label><textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea></div>
                            </div>
                        )}
                        {activeTab === 'permissions' && (
                            <div className="space-y-6">
                                {Object.entries(availablePermissions).map(([module, details]) => (
                                    <div key={module} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-lg font-semibold text-gray-800">{details.name}</h4>
                                            <button type="button" onClick={() => handleModuleToggle(module, details.actions)} className="text-sm text-blue-600 hover:text-blue-800">تحديد/إلغاء الكل</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Object.entries(details.actions).map(([action, actionName]) => (
                                                <label key={action} className="flex items-center space-x-3 space-x-reverse p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <input type="checkbox" checked={!!formData.permissions[module]?.[action]} onChange={(e) => handlePermissionChange(module, action, e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                                    <span className="text-sm font-medium text-gray-900">{actionName}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-2 space-x-reverse">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">إلغاء</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">{loading ? 'جاري الحفظ...' : 'حفظ'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}