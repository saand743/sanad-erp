import { Pool } from 'pg';

// قراءة رابط الاتصال من متغيرات البيئة.
// Vercel تقوم بتعيين هذا المتغير تلقائياً عند استخدام Vercel Postgres.
const connectionString = process.env.POSTGRES_URL;

let pool;

if (!pool) {
  pool = new Pool({
    connectionString,
    // يمكنك إضافة إعدادات أخرى هنا مثل SSL في بيئة الإنتاج
    // Vercel Postgres تتطلب SSL، ومكتبة `pg` تفعل ذلك تلقائياً عند وجود `?sslmode=require` في الرابط.
    // لا تحتاج عادةً لإضافة هذا الإعداد يدوياً مع Vercel.
    ssl: connectionString ? { rejectUnauthorized: false } : false,
  });
}

export default pool;