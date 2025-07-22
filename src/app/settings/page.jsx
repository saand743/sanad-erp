import React, { useState } from 'react';

const translations = {
  ar: {
    title: '������� ������ ������',
    language: '����� ����������',
    currency: '������ ����������',
    paypal: 'PayPal Client ID',
    stripe: 'Stripe Public Key',
    quickbooks: 'QuickBooks Token',
    xero: 'Xero Token',
    save: '��� ���������',
  },
  en: {
    title: 'General System Settings',
    language: 'Default Language',
    currency: 'Default Currency',
    paypal: 'PayPal Client ID',
    stripe: 'Stripe Public Key',
    quickbooks: 'QuickBooks Token',
    xero: 'Xero Token',
    save: 'Save Settings',
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    language: 'ar',
    currency: 'EGP',
    paypalClientId: '',
    stripePublicKey: '',
    quickbooksToken: '',
    xeroToken: '',
  });
  const t = translations[settings.language];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    alert(settings.language === 'ar' ? '�� ��� ��������� �����!' : 'Settings saved successfully!');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.title}</h1>
      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-lg shadow p-6">
        <div>
          <label className="block mb-1">{t.language}</label>
          <select name="language" value={settings.language} onChange={handleChange} className="border rounded px-3 py-2 w-full">
            <option value="ar">�������</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">{t.currency}</label>
          <select name="currency" value={settings.currency} onChange={handleChange} className="border rounded px-3 py-2 w-full">
            <option value="EGP">���� ���� (EGP)</option>
            <option value="SAR">���� ����� (SAR)</option>
            <option value="USD">����� ������ (USD)</option>
            <option value="EUR">���� (EUR)</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">{t.paypal}</label>
          <input name="paypalClientId" value={settings.paypalClientId} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block mb-1">{t.stripe}</label>
          <input name="stripePublicKey" value={settings.stripePublicKey} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block mb-1">{t.quickbooks}</label>
          <input name="quickbooksToken" value={settings.quickbooksToken} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block mb-1">{t.xero}</label>
          <input name="xeroToken" value={settings.xeroToken} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{t.save}</button>
      </form>
    </div>
  );
}
