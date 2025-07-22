'use client';
import React, { useState } from 'react';

function MainComponent() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const reportCategories = [
    {
      id: 'customers',
      name: 'تقارير العملاء',
      icon: 'fas fa-users',
      color: 'bg-blue-500',
      reports: [
        {
          id: 'customer-list',
          name: 'قائمة العملاء',
          description: 'عرض جميع العملاء مع تفاصيلهم الأساسية',
        },
        {
          id: 'customer-statement',
          name: 'كشف حساب العميل',
          description: 'تفاصيل المعاملات والأرصدة للعميل',
        },
        {
          id: 'customer-aging',
          name: 'أعمار الديون',
          description: 'تحليل الديون المستحقة حسب الفترات الزمنية',
        },
        {
          id: 'customer-sales',
          name: 'مبيعات العملاء',
          description: 'تقرير مبيعات كل عميل خلال فترة محددة',
        },
      ],
    },
    {
      id: 'suppliers',
      name: 'تقارير الموردين',
      icon: 'fas fa-truck',
      color: 'bg-green-500',
      reports: [
        {
          id: 'supplier-list',
          name: 'قائمة الموردين',
          description: 'عرض جميع الموردين مع تفاصيلهم',
        },
        {
          id: 'supplier-statement',
          name: 'كشف حساب المورد',
          description: 'تفاصيل المعاملات والأرصدة للمورد',
        },
        {
          id: 'supplier-purchases',
          name: 'مشتريات الموردين',
          description: 'تقرير المشتريات من كل مورد',
        },
        {
          id: 'supplier-payments',
          name: 'مدفوعات الموردين',
          description: 'تقرير المدفوعات للموردين',
        },
      ],
    },
    {
      id: 'sales',
      name: 'تقارير المبيعات',
      icon: 'fas fa-chart-line',
      color: 'bg-purple-500',
      reports: [
        {
          id: 'sales-summary',
          name: 'ملخص المبيعات',
          description: 'إجمالي المبيعات خلال فترة محددة',
        },
        {
          id: 'sales-details',
          name: 'تفاصيل المبيعات',
          description: 'تقرير مفصل لجميع فواتير المبيعات',
        },
        {
          id: 'sales-by-product',
          name: 'المبيعات حسب المنتج',
          description: 'تحليل المبيعات لكل منتج',
        },
        {
          id: 'sales-by-branch',
          name: 'المبيعات حسب الفرع',
          description: 'مقارنة أداء الفروع في المبيعات',
        },
      ],
    },
    {
      id: 'inventory',
      name: 'تقارير المخزون',
      icon: 'fas fa-boxes',
      color: 'bg-orange-500',
      reports: [
        {
          id: 'inventory-status',
          name: 'حالة المخزون',
          description: 'الكميات المتاحة لجميع المنتجات',
        },
        {
          id: 'inventory-movement',
          name: 'حركة المخزون',
          description: 'تتبع حركة دخول وخروج المنتجات',
        },
        {
          id: 'low-stock',
          name: 'المنتجات منخفضة المخزون',
          description: 'المنتجات التي تحتاج إعادة تموين',
        },
        {
          id: 'inventory-valuation',
          name: 'تقييم المخزون',
          description: 'القيمة المالية للمخزون الحالي',
        },
      ],
    },
    {
      id: 'cash',
      name: 'تقارير الصندوق',
      icon: 'fas fa-cash-register',
      color: 'bg-teal-500',
      reports: [
        {
          id: 'cash-flow',
          name: 'التدفق النقدي',
          description: 'حركة النقد الداخل والخارج',
        },
        {
          id: 'cash-balance',
          name: 'رصيد الصندوق',
          description: 'الرصيد الحالي لجميع الصناديق',
        },
        {
          id: 'daily-cash',
          name: 'الصندوق اليومي',
          description: 'تقرير يومي لحركة الصندوق',
        },
        {
          id: 'cash-reconciliation',
          name: 'تسوية الصندوق',
          description: 'مطابقة الرصيد الفعلي مع النظام',
        },
      ],
    },
    {
      id: 'expenses',
      name: 'تقارير المصروفات',
      icon: 'fas fa-receipt',
      color: 'bg-red-500',
      reports: [
        {
          id: 'expense-summary',
          name: 'ملخص المصروفات',
          description: 'إجمالي المصروفات حسب الفئات',
        },
        {
          id: 'expense-details',
          name: 'تفاصيل المصروفات',
          description: 'تقرير مفصل لجميع المصروفات',
        },
        {
          id: 'expense-by-category',
          name: 'المصروفات حسب الفئة',
          description: 'تحليل المصروفات حسب التصنيف',
        },
        {
          id: 'expense-trends',
          name: 'اتجاهات المصروفات',
          description: 'تحليل اتجاهات الإنفاق عبر الزمن',
        },
      ],
    },
    {
      id: 'general',
      name: 'التقرير العام',
      icon: 'fas fa-chart-pie',
      color: 'bg-indigo-500',
      reports: [
        {
          id: 'profit-loss',
          name: 'الأرباح والخسائر',
          description: 'بيان الدخل والمصروفات',
        },
        {
          id: 'balance-sheet',
          name: 'الميزانية العمومية',
          description: 'الأصول والخصوم وحقوق الملكية',
        },
        {
          id: 'trial-balance',
          name: 'ميزان المراجعة',
          description: 'أرصدة جميع الحسابات',
        },
        {
          id: 'financial-ratios',
          name: 'النسب المالية',
          description: 'تحليل الأداء المالي للشركة',
        },
      ],
    },
  ];

  const filteredCategories = reportCategories
    .map((category) => ({
      ...category,
      reports: category.reports.filter(
        (report) =>
          report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter(
      (category) =>
        selectedCategory === 'all' || category.id === selectedCategory,
    )
    .filter((category) => category.reports.length > 0);

  const handleReportClick = (reportId) => {
    // In a real app, you would navigate to the specific report page
    // For now, we just log it.
    console.log('Opening report:', reportId);
    alert(`سيتم فتح تقرير: ${reportId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  نظام التقارير الذكية
                </h1>
                <p className="mt-2 text-gray-600">
                  إدارة وعرض جميع التقارير في سند ERP
                </p>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <i className="fas fa-chart-bar text-4xl text-blue-500"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Custom Report Builder Card */}
        <div className="mb-8">
            <a href="/reports/custom" className="block bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:scale-105 transform transition-transform duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">منشئ التقارير المخصصة</h2>
                        <p className="mt-1 opacity-90">صمم تقاريرك المالية الخاصة بك بسهولة ودقة.</p>
                    </div>
                    <div className="flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg">
                        <i className="fas fa-tools ml-2"></i>
                        <span>ابدأ الآن</span>
                    </div>
                </div>
            </a>
        </div>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="البحث في التقارير..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                جميع التقارير
              </button>
              {reportCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? `${category.color} text-white`
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <i className={`${category.icon} ml-2`}></i>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border"
            >
              <div className={`${category.color} px-6 py-4 rounded-t-lg`}>
                <div className="flex items-center">
                  <i className={`${category.icon} text-white text-xl ml-3`}></i>
                  <h2 className="text-xl font-bold text-white">
                    {category.name}
                  </h2>
                  <span className="mr-auto bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-sm">
                    {category.reports.length} تقرير
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.reports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => handleReportClick(report.id)}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-gray-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {report.name}
                        </h3>
                        <i className="fas fa-external-link-alt text-gray-400 text-xs"></i>
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        {report.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color} bg-opacity-10 text-gray-700`}
                        >
                          <i className={`${category.icon} ml-1 text-xs`}></i>
                          {category.name.replace('تقارير ', '')}
                        </span>
                        <button className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                          عرض التقرير
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد تقارير
            </h3>
            <p className="text-gray-600">
              لم يتم العثور على تقارير تطابق البحث الحالي
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;