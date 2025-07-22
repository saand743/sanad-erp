import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { logActivity } from '@/app/api/audit-log/service';
import { FaEdit, FaTrash } from 'react-icons/fa';

const translations = {
  ar: {
    title: '‘Ã—… «·Õ”«»« ',
    branch: '«·›—⁄',
    code: 'ﬂÊœ «·Õ”«»',
    name_ar: '«”„ «·Õ”«» (⁄—»Ì)',
    name_en: '«”„ «·Õ”«» (≈‰Ã·Ì“Ì)',
    type: '‰Ê⁄ «·Õ”«»',
    parent: '«·Õ”«» «·√»',
    level: '«·„” ÊÏ',
    active: '‰‘ÿ',
    add: '≈÷«›… Õ”«»',
    edit: ' ⁄œÌ·',
    delete: 'Õ–›',
    accounts: '«·Õ”«»«  «·Õ«·Ì…',
    loading: 'Ã«—Ì «· Õ„Ì·...',
    asset: '√’·',
    liability: '«· “«„',
    equity: 'ÕﬁÊﬁ „·ﬂÌ…',
    revenue: '≈Ì—«œ',
    expense: '„’—Ê›',
    none: '»œÊ‰',
    cancel: '≈·€«¡',
    save: 'Õ›Ÿ «· ⁄œÌ·« ',
    editTitle: ' ⁄œÌ· «·Õ”«»',
    successAdd: ' „ ≈÷«›… «·Õ”«» »‰Ã«Õ',
    successEdit: ' „  ⁄œÌ· «·Õ”«» »‰Ã«Õ',
    successDelete: ' „ Õ–› «·Õ”«» »‰Ã«Õ',
    confirmDelete: 'Â· √‰  „ √ﬂœ „‰ Õ–› Â–« «·Õ”«»ø'
  },
  en: {
    title: 'Accounts Tree',
    branch: 'Branch',
    code: 'Account Code',
    name_ar: 'Account Name (Arabic)',
    name_en: 'Account Name (English)',
    type: 'Account Type',
    parent: 'Parent Account',
    level: 'Level',
    active: 'Active',
    add: 'Add Account',
    edit: 'Edit',
    delete: 'Delete',
    accounts: 'Current Accounts',
    loading: 'Loading...',
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expense',
    none: 'None',
    cancel: 'Cancel',
    save: 'Save Changes',
    editTitle: 'Edit Account',
    successAdd: 'Account added successfully',
    successEdit: 'Account updated successfully',
    successDelete: 'Account deleted successfully',
    confirmDelete: 'Are you sure you want to delete this account?'
  }
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('ar');
  const t = translations[language];
  const [form, setForm] = useState({
    parent_id: '',
    code: '',
    name_ar: '',
    name_en: '',
    type: 'asset',
    is_active: true,
    level: 1,
    branch_id: '',
  });
  const [editAccountId, setEditAccountId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) fetchAccounts(selectedBranch);
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      const data = await response.json();
      if (data.success) {
        setBranches(data.branches);
        setSelectedBranch(data.branches[0]?.id || '');
        setForm(f => ({ ...f, branch_id: data.branches[0]?.id || '' }));
      }
    } catch (error) {
      toast.error(t.loading);
    }
  };

  const fetchAccounts = async (branchId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/accounts?branch_id=${branchId}`);
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      } else {
        toast.error(data.error || t.loading);
      }
    } catch (error) {
      toast.error(t.loading);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(t.successAdd);
        setForm({ parent_id: '', code: '', name_ar: '', name_en: '', type: 'asset', is_active: true, level: 1, branch_id: selectedBranch });
        fetchAccounts(selectedBranch);
        await logActivity({
          user_id: 1,
          user_name: 'Admin',
          action: 'CREATE_ACCOUNT',
          entity_type: 'Account',
          entity_id: data.account.id,
          details: `${t.successAdd}: ${data.account.name_ar} (${data.account.code})`
        });
      } else {
        toast.error(data.error || t.loading);
      }
    } catch (error) {
      toast.error(t.loading);
    }
  };

  const handleEditClick = (acc) => {
    setEditAccountId(acc.id);
    setEditForm({ ...acc });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/accounts/${editAccountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(t.successEdit);
        setEditAccountId(null);
        setEditForm(null);
        fetchAccounts(selectedBranch);
      } else {
        toast.error(data.error || t.loading);
      }
    } catch (error) {
      toast.error(t.loading);
    }
  };

  const handleDeleteClick = async (accId) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      const response = await fetch(`/api/accounts/${accId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        toast.success(t.successDelete);
        fetchAccounts(selectedBranch);
      } else {
        toast.error(data.error || t.loading);
      }
    } catch (error) {
      toast.error(t.loading);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        <select value={language} onChange={e => setLanguage(e.target.value)} className="border rounded px-3 py-2">
          <option value="ar">«·⁄—»Ì…</option>
          <option value="en">English</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">{t.branch}</label>
        <select value={selectedBranch} onChange={e => { setSelectedBranch(e.target.value); setForm(f => ({ ...f, branch_id: e.target.value })); }} className="border rounded px-3 py-2">
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">{t.code}</label>
            <input name="code" value={form.code} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1">{t.name_ar}</label>
            <input name="name_ar" value={form.name_ar} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1">{t.name_en}</label>
            <input name="name_en" value={form.name_en} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1">{t.type}</label>
            <select name="type" value={form.type} onChange={handleChange} className="border rounded px-3 py-2 w-full">
              <option value="asset">{t.asset}</option>
              <option value="liability">{t.liability}</option>
              <option value="equity">{t.equity}</option>
              <option value="revenue">{t.revenue}</option>
              <option value="expense">{t.expense}</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">{t.parent}</label>
            <select name="parent_id" value={form.parent_id} onChange={handleChange} className="border rounded px-3 py-2 w-full">
              <option value="">{t.none}</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name_ar} ({acc.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">{t.level}</label>
            <input name="level" type="number" value={form.level} onChange={handleChange} min={1} className="border rounded px-3 py-2 w-full" />
          </div>
          <div className="flex items-center mt-4">
            <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} className="mr-2" />
            <label>{t.active}</label>
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{t.add}</button>
      </form>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">{t.accounts}</h2>
        {loading ? (
          <div>{t.loading}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t.code}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t.name_ar}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t.name_en}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t.type}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t.parent}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t.level}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t.active}</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.edit}/{t.delete}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map(acc => (
                <tr key={acc.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{acc.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{acc.name_ar}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.name_en}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t[acc.type] || acc.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{accounts.find(a => a.id === acc.parent_id)?.name_ar || t.none}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.is_active ? '?' : '?'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onClick={() => handleEditClick(acc)} className="text-indigo-600 hover:text-indigo-800 mx-1" title={t.edit}><FaEdit /></button>
                    <button onClick={() => handleDeleteClick(acc.id)} className="text-red-600 hover:text-red-800 mx-1" title={t.delete}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* ‰«›–…  ⁄œÌ· «·Õ”«» */}
      {editAccountId && editForm && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">{t.editTitle}</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">{t.code}</label>
                <input name="code" value={editForm.code} onChange={handleEditChange} required className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block mb-1">{t.name_ar}</label>
                <input name="name_ar" value={editForm.name_ar} onChange={handleEditChange} required className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block mb-1">{t.name_en}</label>
                <input name="name_en" value={editForm.name_en} onChange={handleEditChange} className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block mb-1">{t.type}</label>
                <select name="type" value={editForm.type} onChange={handleEditChange} className="border rounded px-3 py-2 w-full">
                  <option value="asset">{t.asset}</option>
                  <option value="liability">{t.liability}</option>
                  <option value="equity">{t.equity}</option>
                  <option value="revenue">{t.revenue}</option>
                  <option value="expense">{t.expense}</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">{t.parent}</label>
                <select name="parent_id" value={editForm.parent_id} onChange={handleEditChange} className="border rounded px-3 py-2 w-full">
                  <option value="">{t.none}</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name_ar} ({acc.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">{t.level}</label>
                <input name="level" type="number" value={editForm.level} onChange={handleEditChange} min={1} className="border rounded px-3 py-2 w-full" />
              </div>
              <div className="flex items-center mt-4">
                <input name="is_active" type="checkbox" checked={editForm.is_active} onChange={handleEditChange} className="mr-2" />
                <label>{t.active}</label>
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{t.save}</button>
            <button type="button" onClick={() => { setEditAccountId(null); setEditForm(null); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 ml-2">{t.cancel}</button>
          </form>
        </div>
      )}
    </div>
  );
}
