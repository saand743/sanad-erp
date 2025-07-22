'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSpinner, FaLock, FaTruck } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';

// يمكن إعادة استخدام هذا المكون أو وضعه في ملف مشترك
function AccessDenied({ requiredPermission }) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-12 bg-gray-50 rounded-lg text-center">
            <FaLock className="text-5xl text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">وصول مرفوض</h2>
            <p className="text-gray-600 mt-2">ليس لديك الصلاحيات اللازمة لعرض هذه الصفحة.</p>
            {requiredPermission && (
                <div className="mt-4 bg-red-100 text-red-700 text-sm font-mono p-2 rounded">
                    الصلاحية المطلوبة: {requiredPermission}
                </div>
            )}
        </div>
    );
}

export default function SuppliersPage() {
    const { hasPermission, loading: authLoading, token } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSuppliers = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch('/api/suppliers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSuppliers(data.suppliers);
            } else {
                toast.error(data.error || 'فشل في جلب قائمة الموردين.');
            }
        } catch (error) {
            toast.error('خطأ في الشبكة عند جلب الموردين.');
            console.error("Fetch suppliers error:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) {
            if (hasPermission('suppliers.view')) {
                fetchSuppliers();
            } else {
                setLoading(false);
            }
        }
    }, [authLoading, token, hasPermission, fetchSuppliers]);

    const handleDeleteSupplier = async (supplierId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }
        const toastId = toast.loading('جاري حذف المورد...');
        try {
            const response = await fetch('/api/suppliers', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: supplierId }),
            });
            const data = await response.json();
            toast.dismiss(toastId);
            if (data.success) {
                toast.success('تم حذف المورد بنجاح!');
                fetchSuppliers(); // Refresh the list
            } else {
                toast.error(data.error || 'فشل في حذف المورد.');
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('خطأ في الشبكة عند حذف المورد.');
        }
    };

    if (authLoading || loading) {
        return <div className="flex justify-center items-center h-96"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
    }

    if (!hasPermission('suppliers.view')) {
        return <div className="p-6"><AccessDenied requiredPermission="suppliers.view" /></div>;
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="p-6 space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaTruck /> إدارة الموردين</h1>
                {hasPermission('suppliers.create') && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <FaPlus /><span>مورد جديد</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المورد</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الحالة</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {suppliers.length > 0 ? suppliers.map((supplier) => (
                            <tr key={supplier.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{supplier.phone || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.email || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(supplier.status)}`}>{supplier.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex justify-center gap-x-4">
                                    {hasPermission('suppliers.view') && <button className="text-blue-600 hover:text-blue-800" title="عرض"><FaEye /></button>}
                                    {hasPermission('suppliers.edit') && <button className="text-indigo-600 hover:text-indigo-800" title="تعديل"><FaEdit /></button>}
                                    {hasPermission('suppliers.delete') && <button onClick={() => handleDeleteSupplier(supplier.id)} className="text-red-600 hover:text-red-800" title="حذف"><FaTrash /></button>}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-gray-500">
                                    <FaTruck className="mx-auto text-4xl mb-2" />
                                    <p>لا يوجد موردين لعرضهم حالياً.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}