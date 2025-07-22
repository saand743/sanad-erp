'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useAuth from '@/hooks/useAuth';

const initialInvoiceState = {
    supplier_id: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    items: [{ product_id: '', quantity: 1, unit_price: 0, total: 0 }],
    notes: '',
};

export default function PurchaseInvoiceModal({ isOpen, onClose, onSave }) {
    const { token } = useAuth();
    const [invoice, setInvoice] = useState(initialInvoiceState);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSuppliers = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch('/api/suppliers?all=true', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSuppliers(data.suppliers);
            } else {
                toast.error('فشل في جلب قائمة الموردين.');
            }
        } catch (error) {
            toast.error('خطأ في الشبكة عند جلب الموردين.');
        }
    }, [token]);

    useEffect(() => {
        if (isOpen) {
            fetchSuppliers();
            setInvoice(initialInvoiceState);
        }
    }, [isOpen, fetchSuppliers]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInvoice(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const items = [...invoice.items];
        items[index][name] = value;

        const quantity = parseFloat(items[index].quantity) || 0;
        const unit_price = parseFloat(items[index].unit_price) || 0;
        items[index].total = quantity * unit_price;

        setInvoice(prev => ({ ...prev, items }));
    };

    const addItem = () => {
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0, total: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (invoice.items.length <= 1) return;
        const items = invoice.items.filter((_, i) => i !== index);
        setInvoice(prev => ({ ...prev, items }));
    };

    const calculateGrandTotal = () => {
        return invoice.items.reduce((acc, item) => acc + item.total, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(invoice);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" dir="rtl">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">فاتورة شراء جديدة</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">المورد *</label><select name="supplier_id" value={invoice.supplier_id} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="" disabled>اختر مورد</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">رقم الفاتورة *</label><input type="text" name="invoice_number" value={invoice.invoice_number} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الفاتورة *</label><input type="date" name="invoice_date" value={invoice.invoice_date} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
                        </div>
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-2">الأصناف</h3>
                            <div className="space-y-2">
                                {invoice.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-4"><input type="text" name="product_id" value={item.product_id} onChange={(e) => handleItemChange(index, e)} placeholder="اسم أو كود المنتج" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
                                        <div className="col-span-2"><input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} placeholder="الكمية" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
                                        <div className="col-span-2"><input type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} placeholder="سعر الوحدة" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
                                        <div className="col-span-3"><input type="text" readOnly value={new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(item.total)} className="w-full px-3 py-2 border-gray-200 bg-gray-50 rounded-lg text-center"/></div>
                                        <div className="col-span-1"><button type="button" onClick={() => removeItem(index)} disabled={invoice.items.length <= 1} className="text-red-500 hover:text-red-700 disabled:text-gray-300">&times;</button></div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addItem} className="mt-2 text-blue-600 hover:text-blue-800 text-sm">إضافة صنف آخر +</button>
                        </div>
                        <div className="border-t pt-4 flex justify-end">
                            <div className="w-1/3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>الإجمالي:</span>
                                    <span>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(calculateGrandTotal())}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-2 space-x-reverse">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">إلغاء</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">{loading ? 'جاري الحفظ...' : 'حفظ الفاتورة'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}