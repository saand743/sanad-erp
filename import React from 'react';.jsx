import React from 'react';

// A reusable card component
const StructureCard = ({ icon, value, description, colors }) => (
  <div className={`${colors.bg} p-6 rounded-lg text-center`}>
    <div className={`${colors.iconBg} text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
      <i className={`${icon} text-2xl`}></i>
    </div>
    <h3 className={`text-xl font-bold ${colors.text} mb-2`}>{value}</h3>
    <p className="text-gray-700">{description}</p>
  </div>
);

const structureItems = [
  {
    icon: 'fas fa-th-large',
    value: '11',
    description: 'وحدة رئيسية متكاملة',
    colors: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      text: 'text-blue-600',
    },
  },
  {
    icon: 'fas fa-database',
    value: '22',
    description: 'جدول قاعدة بيانات محسنة',
    colors: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-500',
      text: 'text-green-600',
    },
  },
  {
    icon: 'fas fa-shield-alt',
    value: 'متقدم',
    description: 'نظام صلاحيات متقدم',
    colors: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-500',
      text: 'text-purple-600',
    },
  },
  {
    icon: 'fas fa-desktop',
    value: 'RTL',
    description: 'واجهات احترافية',
    colors: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-500',
      text: 'text-orange-600',
    },
  },
];

const StructureSection = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">🏗️ هيكل النظام</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {structureItems.map((item, index) => <StructureCard key={index} {...item} />)}
    </div>
  </div>
);

export default StructureSection;