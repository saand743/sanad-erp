// هذا تنفيذ وهمي. في تطبيق حقيقي، ستتفاعل مع جدول 'audit_logs' في قاعدة البيانات.
let mockAuditLogs = [
  { id: 5, user_id: 1, user_name: 'Admin User', action: 'DELETE_PURCHASE_ATTACHMENT', entity_type: 'PurchaseInvoice', entity_id: 1, details: 'حذف مرفق (invoice_2024.pdf) من الفاتورة رقم INV-P-2024-050', timestamp: '2024-05-21T12:00:00Z' },
  { id: 4, user_id: 1, user_name: 'Admin User', action: 'DELETE_ROLE', entity_type: 'Role', entity_id: 4, details: 'حذف الدور: موظف مخزن', timestamp: '2024-05-20T10:00:00Z' },
  { id: 3, user_id: 2, user_name: 'Accountant User', action: 'CREATE_PURCHASE_INVOICE', entity_type: 'PurchaseInvoice', entity_id: 2, details: 'إنشاء فاتورة شراء جديدة برقم INV-P-2024-055', timestamp: '2024-05-19T15:30:00Z' },
  { id: 2, user_id: 1, user_name: 'Admin User', action: 'UPDATE_ROLE_PERMISSIONS', entity_type: 'Role', entity_id: 3, details: 'تحديث صلاحيات الدور: مندوب مبيعات', timestamp: '2024-05-18T11:45:00Z' },
  { id: 1, user_id: 1, user_name: 'Admin User', action: 'CREATE_SUPPLIER', entity_type: 'Supplier', entity_id: 1, details: 'إنشاء مورد جديد: شركة الإلكترونيات المتقدمة', timestamp: '2024-05-17T09:00:00Z' },
];

/**
 * يسجل نشاطًا جديدًا في النظام.
 * @param {object} logData - بيانات النشاط المراد تسجيله.
 * @param {number} logData.user_id - معرف المستخدم الذي قام بالإجراء.
 * @param {string} logData.user_name - اسم المستخدم.
 * @param {string} logData.action - نوع الإجراء (e.g., 'DELETE_SUPPLIER').
 * @param {string} logData.entity_type - نوع الكيان (e.g., 'Supplier').
 * @param {number} logData.entity_id - معرف الكيان.
 * @param {string} logData.details - تفاصيل إضافية حول الإجراء.
 */
export async function logActivity(logData) {
  const newLog = {
    id: mockAuditLogs.length > 0 ? Math.max(...mockAuditLogs.map(l => l.id)) + 1 : 1,
    timestamp: new Date().toISOString(),
    ...logData,
  };
  mockAuditLogs.unshift(newLog); // إضافة السجل الجديد في بداية المصفوفة
  console.log('[Audit Log Service] Logged:', newLog);
  return newLog;
}

export async function getLogs(filters = {}) {
  const { user_name, start_date, end_date, action_type, entity_type } = filters;
  let filteredLogs = [...mockAuditLogs];

  // فلترة باسم المستخدم
  if (user_name) {
    filteredLogs = filteredLogs.filter(log => 
      log.user_name.toLowerCase().includes(user_name.toLowerCase())
    );
  }

  // فلترة بنوع الإجراء
  if (action_type) {
    filteredLogs = filteredLogs.filter(log => log.action === action_type);
  }
  
  // فلترة بنوع الكيان
  if (entity_type) {
    filteredLogs = filteredLogs.filter(log => log.entity_type === entity_type);
  }

  // فلترة بتاريخ البدء
  if (start_date) {
    filteredLogs = filteredLogs.filter(log => 
      new Date(log.timestamp) >= new Date(start_date)
    );
  }

  // فلترة بتاريخ الانتهاء
  if (end_date) {
    const toDate = new Date(end_date);
    toDate.setHours(23, 59, 59, 999); // لتضمين اليوم بأكمله
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= toDate);
  }

  return { logs: filteredLogs };
}