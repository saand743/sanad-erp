0,0 @@
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AuditLogDetails from '@/components/admin/AuditLogDetails';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/audit-logs?page=${currentPage}&limit=15`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setLogs(data.data);
        setPagination(data.pagination);
      } catch (error) {
        toast.error('حدث خطأ أثناء جلب سجلات التدقيق.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentPage]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">سجل تدقيق النظام</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستخدم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراء</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الجدول</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">جاري التحميل...</td></tr>
            ) : (
              logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user_email || 'نظام'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.action_type === 'INSERT' ? 'bg-green-100 text-green-800' :
                      log.action_type === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{log.table_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => setSelectedLog(log)} className="text-indigo-600 hover:text-indigo-900">
                      عرض التفاصيل
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
          >
            السابق
          </button>
          <span className="text-sm text-gray-700">
            صفحة {pagination['currentPage']} من {pagination['totalPages']}
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === pagination['totalPages'] || loading}
            className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}

      {/* Modal for details */}
      {selectedLog && <AuditLogDetails log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
};

export default AuditLogPage;