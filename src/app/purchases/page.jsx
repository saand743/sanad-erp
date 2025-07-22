'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSpinner, FaLock, FaFileInvoice } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';
import PurchaseInvoiceModal from '@/components/purchases/PurchaseInvoiceModal';

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

export default function PurchasesPage() {
    const { hasPermission, loading: authLoading, token } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/purchases', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setInvoices(data.invoices);
            } else {
                toast.error(data.error || 'فشل في جلب فواتير الشراء.');
            }
        } catch (error) {
            toast.error('خطأ في الشبكة عند جلب فواتير الشراء.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) {
            if (hasPermission('purchases.view')) {
                fetchInvoices();
            } else {
                setLoading(false);
            }
        }
    }, [authLoading, token, hasPermission, fetchInvoices]);

    const handleSaveInvoice = async (invoiceData) => {
        const toastId = toast.loading('جاري حفظ الفاتورة...');
        try {
            const response = await fetch('/api/purchases', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData),
            });
            const data = await response.json();
            toast.dismiss(toastId);
            if (data.success) {
                toast.success('تم حفظ الفاتورة بنجاح!');
                setIsModalOpen(false);
                fetchInvoices(); // Refresh the list
            } else {
                toast.error(data.error || 'فشل في حفظ الفاتورة.');
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('خطأ في الشبكة عند حفظ الفاتورة.');
        }
    };

    if (authLoading || loading) {
        return <div className="flex justify-center items-center h-96"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
    }

    if (!hasPermission('purchases.view')) {
        return <div className="p-6"><AccessDenied requiredPermission="purchases.view" /></div>;
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <PurchaseInvoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveInvoice}
            />
            <div className="p-6 space-y-6" dir="rtl">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaFileInvoice /> إدارة المشتريات</h1>
                    {hasPermission('purchases.create') && (
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <FaPlus /><span>فاتورة شراء جديدة</span>
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الفاتورة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المورد</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الفاتورة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجمالي</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.length > 0 && invoices.map((invoice) => (
                               <tr key={invoice.id}>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.supplier_name}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(invoice.total_amount)}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-center"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(invoice.status)}`}>{invoice.status === 'paid' ? 'مدفوعة' : 'معلقة'}</span></td>
                                   <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex justify-center gap-x-4">
                                       {hasPermission('purchases.view') && <button className="text-blue-600 hover:text-blue-800" title="عرض"><FaEye /></button>}
                                       {hasPermission('purchases.edit') && <button className="text-indigo-600 hover:text-indigo-800" title="تعديل"><FaEdit /></button>}
                                       {hasPermission('purchases.delete') && <button className="text-red-600 hover:text-red-800" title="حذف"><FaTrash /></button>}
                                   </td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                    {invoices.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500">
                            <FaFileInvoice className="mx-auto text-4xl mb-2" />
                            <p>لا توجد فواتير لعرضها حالياً.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}