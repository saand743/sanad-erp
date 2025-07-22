'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { FaPlus, FaEdit, FaTrash, FaShieldAlt, FaUsers, FaUserTag } from 'react-icons/fa';
import RoleModal from '@/components/roles/RoleModal';
import AssignUserModal from '@/components/roles/AssignUserModal';

export default function RolesManagementPage() {
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState(null);
    const [activeTab, setActiveTab] = useState('roles');

    const getAuthHeaders = useCallback(() => {
        const token = Cookies.get('token');
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const headers = getAuthHeaders();
            const response = await fetch('/api/roles', { headers });
            const data = await response.json();
            if (data.success) {
                setRoles(data.roles);
            } else {
                toast.error(data.error || 'فشل في جلب الأدوار.');
            }
        } catch (error) {
            toast.error('خطأ في الشبكة عند جلب الأدوار.');
        }
    }, [getAuthHeaders]);

    const fetchUsers = useCallback(async () => {
        try {
            const headers = getAuthHeaders();
            const response = await fetch('/api/users', { headers });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            } else {
                toast.error(data.error || 'فشل في جلب المستخدمين.');
            }
        } catch (error) {
            toast.error('خطأ في الشبكة عند جلب المستخدمين.');
        }
    }, [getAuthHeaders]);

    const loadData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchRoles(), fetchUsers()]);
    }, [fetchRoles, fetchUsers]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddClick = () => {
        setRoleToEdit(null);

    const handleAssignClick = () => {
        setIsAssignModalOpen(true);
    };

    const handleDeleteClick = async (roleId, roleName) => {

            if (data.success) {
                toast.success('تم حذف الدور بنجاح!');
                loadData();
            } else {
                toast.error(data.error || 'فشل في حذف الدور.');
            }
        <>
            <RoleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadData}
                roleToEdit={roleToEdit}
                getAuthHeaders={getAuthHeaders}
            />
            <AssignUserModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onSuccess={loadData}
                users={users}
                roles={roles}
                getAuthHeaders={getAuthHeaders}
            />
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">إدارة الأدوار والصلاحيات</h1>
                    <div className="flex gap-2">
                        <button onClick={handleAssignClick} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <FaUserTag /><span>ربط مستخدم</span>
                        </button>
                        <button onClick={handleAddClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <FaPlus /><span>دور جديد</span>
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 space-x-reverse">
                        <button onClick={() => setActiveTab('roles')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'roles' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><FaShieldAlt /> إدارة الأدوار</button>
                        <button onClick={() => setActiveTab('users')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><FaUsers /> إدارة المستخدمين</button>
                    </nav>
                </div>

                {loading ? (
                    <div className="text-center py-12">جاري التحميل...</div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        {activeTab === 'roles' && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">النوع</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {roles.map((role) => (
                                        <tr key={role.id}>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{role.name_ar}</div><div className="text-sm text-gray-500">{role.name}</div></td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate">{role.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.is_system_role ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{role.is_system_role ? 'نظام' : 'مخصص'}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center gap-x-4">
                                                    <button onClick={() => handleEditClick(role)} className="text-indigo-600 hover:text-indigo-800" title="تعديل"><FaEdit /></button>
                                                    {!role.is_system_role && (
                                                        <button onClick={() => handleDeleteClick(role.id, role.name_ar)} className="text-red-600 hover:text-red-800" title="حذف"><FaTrash /></button>
                                                    )}
                                                    {role.is_system_role && (
                                                        <span className="text-gray-400 cursor-not-allowed" title="لا يمكن حذف أدوار النظام"><FaTrash /></span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'users' && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الإنشاء</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{user.full_name}</div><div className="text-sm text-gray-500">{user.email}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role_name || <span className="text-gray-400">بدون دور</span>}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.is_active ? 'نشط' : 'غير نشط'}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString('ar-SA')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

