import React from 'react';

const StructureSection = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">🏗️ هيكل النظام</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-blue-50 p-6 rounded-lg text-center">
        <div className="bg-blue-500 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <i className="fas fa-th-large text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-blue-600 mb-2">11</h3>
        <p className="text-gray-700">وحدة رئيسية متكاملة</p>
      </div>  
      <div className="bg-green-50 p-6 rounded-lg text-center">
        <div className="bg-green-500 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <i className="fas fa-database text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-green-600 mb-2">22</h3>
        <p className="text-gray-700">جدول قاعدة بيانات محسنة</p>
      </div>
      <div className="bg-purple-50 p-6 rounded-lg text-center">
        <div className="bg-purple-500 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <i className="fas fa-shield-alt text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-purple-600 mb-2">متقدم</h3>
        <p className="text-gray-700">نظام صلاحيات متقدم</p>
      </div>
      <div className="bg-orange-50 p-6 rounded-lg text-center">
        <div className="bg-orange-500 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <i className="fas fa-desktop text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-orange-600 mb-2">RTL</h3>
        <p className="text-gray-700">واجهات احترافية</p>
      </div>
    </div>
  </div>
);

export default StructureSection;