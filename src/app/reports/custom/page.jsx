'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { FaFileCsv, FaPrint, FaSpinner, FaFilter, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';

export default function CustomReportPage() {
    const [reportOptions, setReportOptions] = useState({
        reportType: 'sales_summary',
        startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        filters: {
            customerId: '',
        },
    });
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);

    const availableReports = [
        { id: 'sales_summary', name: 'ملخص المبيعات' },
    ];

    const getAuthHeaders = useCallback(() => {
        const token = Cookies.get('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }, []);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch('/api/customers?all=true', { headers: getAuthHeaders() });
                const data = await response.json();
                if (data.success) {
                    setCustomers(data.customers);
                } else {
                    toast.error('فشل في جلب قائمة العملاء.');
                }
            } catch (err) {
                toast.error('خطأ في الشبكة عند جلب العملاء.');
            }
        };
        fetchCustomers();
    }, [getAuthHeaders]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name in reportOptions.filters) {
            setReportOptions(prev => ({
                ...prev,
                filters: { ...prev.filters, [name]: value },
            }));
        } else {
            setReportOptions(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        setReportData(null);
        setError(null);
        const toastId = toast.loading('جاري إنشاء التقرير...');

        try {
            const payload = {
                reportType: reportOptions.reportType,
                startDate: reportOptions.startDate,
                endDate: reportOptions.endDate,
                filters: [
                    { field: 'customer_id', value: reportOptions.filters.customerId }
                ].filter(f => f.value)
            };

            const response = await fetch('/api/reports/custom', {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            toast.dismiss(toastId);

            if (data.success) {
                setReportData(data.report);
                toast.success('تم إنشاء التقرير بنجاح.');
            } else {
                setError(data.error || 'فشل في إنشاء التقرير.');
                toast.error(data.error || 'فشل في إنشاء التقرير.');
            }
        } catch (err) {
            toast.dismiss(toastId);
            setError('حدث خطأ في الشبكة.');
            toast.error('حدث خطأ في الشبكة.');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!reportData || !reportData.data || reportData.data.length === 0) return;
        
        const headers = Object.keys(reportData.data[0]);
        const headerTranslations = { customer_name: 'اسم العميل', invoice_number: 'رقم الفاتورة', invoice_date: 'تاريخ الفاتورة', total_amount: 'المبلغ الإجمالي', payment_status: 'حالة الدفع' };
        const translatedHeaders = headers.map(h => headerTranslations[h] || h);

        const csvContent = [
            translatedHeaders.join(','),
            ...reportData.data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportOptions.reportType}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printReport = () => {
        const content = document.getElementById('report-table-container').innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>طباعة التقرير</title>');
        printWindow.document.write('<style> body { font-family: Cairo, sans-serif; direction: rtl; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: right; } th { background-color: #f2f2f2; } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(content);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const renderReportTable = () => {
        if (!reportData) return null;

        if (reportData.data.length === 0) {
            return <div className="text-center py-12 bg-gray-50 rounded-lg"><i className="fas fa-search text-gray-400 text-4xl mb-4"></i><h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات</h3><p className="text-gray-600">لم يتم العثور على نتائج تطابق معايير البحث.</p></div>;
        }

        const headers = Object.keys(reportData.data[0]);
        const headerTranslations = { customer_name: 'اسم العميل', invoice_number: 'رقم الفاتورة', invoice_date: 'تاريخ الفاتورة', total_amount: 'المبلغ الإجمالي', payment_status: 'حالة الدفع' };

        return (
            <div id="report-table-container">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">نتائج التقرير</h3>
                    <div className="flex gap-2">
                        <button onClick={printReport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"><FaPrint /> طباعة</button>
                        <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"><FaFileCsv /> تصدير CSV</button>
                    </div>
                </div>
                <div className="overflow-x-auto border rounded-lg"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{headers.map(header => (<th key={header} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{headerTranslations[header] || header}</th>))}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{reportData.data.map((row, index) => (<tr key={index}>{headers.map(header => (<td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{header === 'invoice_date' ? new Date(row[header]).toLocaleDateString('ar-SA') : row[header]}</td>))}</tr>))}</tbody></table></div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">منشئ التقارير المخصصة</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div><label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1"><FaFileAlt className="inline ml-1"/> نوع التقرير</label><select id="reportType" name="reportType" value={reportOptions.reportType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">{availableReports.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                    <div><label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1"><FaCalendarAlt className="inline ml-1"/> تاريخ البدء</label><input type="date" id="startDate" name="startDate" value={reportOptions.startDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/></div>
                    <div><label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1"><FaCalendarAlt className="inline ml-1"/> تاريخ الانتهاء</label><input type="date" id="endDate" name="endDate" value={reportOptions.endDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/></div>
                    <div><label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1"><FaFilter className="inline ml-1"/> فلترة بالعميل</label><select id="customerId" name="customerId" value={reportOptions.filters.customerId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="">كل العملاء</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    <div className="lg:col-span-4"><button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2">{loading ? <><FaSpinner className="animate-spin"/> جاري الإنشاء...</> : 'إنشاء التقرير'}</button></div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[20rem]">
                {loading && <div className="flex justify-center items-center h-full"><FaSpinner className="animate-spin text-blue-500 text-4xl"/></div>}
                {error && <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg"><i className="fas fa-exclamation-triangle text-4xl mb-4"></i><h3 className="text-lg font-medium mb-2">حدث خطأ</h3><p>{error}</p></div>}
                {!loading && !error && renderReportTable()}
            </div>
        </div>
    );
}