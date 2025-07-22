import { db } from '@/lip/db';
import { NextResponse } from 'next/server';

/**
 * @description ربط مستخدم بدور معين أو إلغاء الربط
 * @route POST /api/users/assign-role
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, roleId } = body;

        if (!userId) {
            return NextResponse.json({ success: false, error: 'معرف المستخدم مطلوب.' }, { status: 400 });
        }

        // roleId يمكن أن يكون null لإلغاء ربط الدور
        const result = await db.query(
            `UPDATE users SET role_id = $1, updated_at = NOW() WHERE id = $2 RETURNING id, role_id`,
            [roleId || null, userId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, error: 'المستخدم غير موجود.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'تم تحديث دور المستخدم بنجاح.' });
    } catch (error) {
        console.error('API_ASSIGN_ROLE_ERROR:', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ أثناء ربط المستخدم بالدور.' }, { status: 500 });
    }
}