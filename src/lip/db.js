import { Pool } from 'pg';

let pool;

if (!pool) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

export const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};

// ملاحظة: هذا الإعداد مخصص للاتصال بقواعد بيانات سحابية مثل Vercel Postgres.
// قد تحتاج إلى تعديل كائن الإعدادات بناءً على مزود قاعدة البيانات الخاص بك.

