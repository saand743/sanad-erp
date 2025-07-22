import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * @description جلب قائمة المستخدمين مع أدوارهم
 * @route GET /api/users
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const all = searchParams.get('all') === 'true';

        // جلب قائمة كاملة مبسطة للاستخدام في القوائم المنسدلة
        if (all) {
            const result = await db.query(`SELECT id, full_name, email FROM users ORDER BY full_name ASC`);
            return NextResponse.json({ success: true, users: result.rows });
        }

        // جلب قائمة مفصلة للعرض في الجداول
        const result = await db.query(`
            SELECT u.id, u.full_name, u.username, u.email, u.is_active, u.created_at, r.name_ar as role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        `);

        return NextResponse.json({ success: true, users: result.rows });
    } catch (error) {
        console.error('API_USERS_GET_ERROR:', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب المستخدمين.' }, { status: 500 });
    }
}