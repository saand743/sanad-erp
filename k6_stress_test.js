import http from 'k6/http';
import { check, sleep } from 'k6';

// --- إعدادات الاختبار ---
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // زيادة تدريجية إلى 20 مستخدم افتراضي خلال 30 ثانية
    { duration: '1m', target: 20 },   // ثبات عند 20 مستخدم لمدة دقيقة
    { duration: '10s', target: 0 },   // تقليل عدد المستخدمين إلى 0
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% من الطلبات يجب أن تتم في أقل من 500ms
    'http_req_failed': ['rate<0.01'],   // نسبة فشل الطلبات يجب أن تكون أقل من 1%
  },
};

const BASE_URL = 'http://localhost:3000/api'; // غيّر هذا إلى رابط نظامك
let authToken;

// --- سيناريو الاختبار ---

// 1. مرحلة الإعداد (تنفذ مرة واحدة)
export function setup() {
  // تسجيل الدخول للحصول على توكن المصادقة
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'admin@example.com', // استخدم بيانات مستخدم حقيقية
    password: 'password123',
  }));
  check(loginRes, { 'login successful': (r) => r.status === 200 });
  return { token: loginRes.json('token') };
}

// 2. السيناريو الرئيسي (يتم تكراره بواسطة كل مستخدم افتراضي)
export default function (data) {
  authToken = data.token;
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  // جلب قائمة المنتجات (عملية قراءة شائعة)
  const productsRes = http.get(`${BASE_URL}/inventory/products`, { headers });
  check(productsRes, { 'fetched products': (r) => r.status === 200 });

  sleep(1); // انتظار ثانية قبل الإجراء التالي

  // إنشاء فاتورة مبيعات (عملية كتابة شائعة)
  const invoicePayload = JSON.stringify({
    customer_id: 1, // استخدم ID عميل حقيقي
    items: [{ product_id: 1, quantity: 1, unit_price: 150 }], // استخدم ID منتج حقيقي
  });
  const invoiceRes = http.post(`${BASE_URL}/sales`, invoicePayload, { headers });
  check(invoiceRes, { 'created invoice': (r) => r.status === 201 });

  sleep(2);
}