'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaTachometerAlt, FaShoppingCart, FaTruck, FaBoxOpen, FaUsers, FaFileInvoiceDollar, FaCog, FaSignOutAlt } from 'react-icons/fa';

const navLinks = [
  { href: '/', label: 'لوحة التحكم', icon: FaTachometerAlt, permission: { module: 'dashboard', action: 'read' } },
  { href: '/sales', label: 'المبيعات', icon: FaShoppingCart, permission: { module: 'sales', action: 'read' } },
  { href: '/purchases', label: 'المشتريات', icon: FaTruck, permission: { module: 'purchases', action: 'read' } },
  { href: '/inventory', label: 'المخزون', icon: FaBoxOpen, permission: { module: 'inventory', action: 'read' } },
  { href: '/customers', label: 'العملاء', icon: FaUsers, permission: { module: 'customers', action: 'read' } },
  { href: '/suppliers', label: 'الموردين', icon: FaUsers, permission: { module: 'suppliers', action: 'read' } },
  { href: '/cash', label: 'الخزنة', icon: FaFileInvoiceDollar, permission: { module: 'cash', action: 'read' } },
];

const NavLink = ({ href, icon: Icon, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}>
      <Icon className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
      {children}
    </Link>
  );
};

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout, hasPermission } = useAuth();

  const filteredNavLinks = navLinks.filter(link => 
    hasPermission(link.permission.module, link.permission.action)
  );

  return (
    <>
      <aside className={`fixed inset-y-0 right-0 z-30 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}>
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-2xl font-bold text-blue-600">نظام سند</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavLinks.map(link => (
            <NavLink key={link.href} href={link.href} icon={link.icon}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <NavLink href="/suppliers" icon={FaCog}>
            الإعدادات
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center mt-2 px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}