'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Link from 'next/link';

function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        user_name: '',
        start_date: '',
        end_date: '',
    });

    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await fetch('/api/audit-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page, limit: 15, ...filters }),
            });
            const data = await response.json();
            if (data.success) {
                setLogs(data.logs);
                setPagination(data.pagination);
                setCurrentPage(page);
            } else {
                toast.error(data.error || 'فشل في جلب سجلات النشاط');
            }
        } catch (error) {
            toast.error('حدث خطأ في الشبكة');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchLogs(1);
    }, [fetchLogs]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        fetchLogs(1);
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= pagination.total_pages) {
            fetchLogs(page);
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
            <Toaster position="bottom-center" />
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-reverse space-x-4">
                            <div className="bg-gray-100 p-2 rounded-lg">
                                <i className="fas fa-history text-gray-600 text-xl"></i>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">سجل النشاطات</h1>
                                <p className="text-sm text-gray-500">تتبع جميع الإجراءات التي تمت في النظام</p>
                            </div>
                        </div>
                        <Link href="/">
                            <span className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-reverse space-x-2 transition-colors">
                                <i className="fas fa-arrow-left"></i>
                                <span>العودة للرئيسية</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                            <input
                                type="text"
                                name="user_name"
                                value={filters.user_name}
                                onChange={handleFilterChange}
                                placeholder="بحث باسم المستخدم..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                            <input
                                type="date"
                                name="start_date"
                                value={filters.start_date}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                            <input
                                type="date"
                                name="end_date"
                                value={filters.end_date}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleApplyFilters}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center