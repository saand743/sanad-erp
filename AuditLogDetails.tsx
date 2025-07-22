0,0 @@
import React from 'react';
import { X } from 'react-icons/fa';

interface AuditLogDetailsProps {
  log: any; // The full log entry
  onClose: () => void;
}

const renderValue = (value: any) => {
  if (value === null) return <em className="text-gray-400">null</em>;
  if (typeof value === 'object') return <pre className="text-xs bg-gray-800 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>;
  return String(value);
};

const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({ log, onClose }) => {
  const oldData = log.old_data || {};
  const newData = log.new_data || {};
  const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800">تفاصيل التغيير (ID: {log.id})</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <p><strong>المستخدم:</strong> {log.user_email || 'نظام'}</p>
            <p><strong>الإجراء:</strong> {log.action_type}</p>
            <p><strong>الجدول:</strong> {log.table_name}</p>
            <p><strong>معرف السجل:</strong> {log.record_id}</p>
            <p><strong>التاريخ:</strong> {new Date(log.created_at).toLocaleString()}</p>
        </div>

        <h4 className="text-lg font-semibold mb-2">البيانات المتغيرة:</h4>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border text-right font-semibold">الحقل</th>
              <th className="p-2 border text-right font-semibold">القيمة القديمة</th>
              <th className="p-2 border text-right font-semibold">القيمة الجديدة</th>
            </tr>
          </thead>
          <tbody>
            {allKeys.map(key => {
              const oldValue = oldData[key];
              const newValue = newData[key];
              if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return null;

              return (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="p-2 border font-mono">{key}</td>
                  <td className="p-2 border bg-red-50 text-red-800">{renderValue(oldValue)}</td>
                  <td className="p-2 border bg-green-50 text-green-800">{renderValue(newValue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogDetails;