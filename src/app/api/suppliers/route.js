import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { db } from '@/lip/db';

/**
 * @description جلب قائمة الموردين من قاعدة البيانات
 * @permission suppliers.view
 */
async function getSuppliers(request) {
    try {
        const { searchParams } = new URL(request.url);
        const all = searchParams.get('all') === 'true';
        let query = 'SELECT id, name, phone, email, is_active FROM suppliers WHERE deleted_at IS NULL';
        let params = [];
        if (all) {
            query = 'SELECT id, name FROM suppliers WHERE deleted_at IS NULL';
        }
        const result = await db.query(query, params);
        if (all) {
            return NextResponse.json({ success: true, suppliers: result.rows });
        }
        // ترقيم الصفحات (بسيط)
        const suppliers = result.rows;
        return NextResponse.json({ success: true, suppliers, pagination: { total_count: suppliers.length, total_pages: 1, current_page: 1 } });
    } catch (error) {
        console.error('API_SUPPLIERS_GET_ERROR:', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب الموردين.' }, { status: 500 });
    }
}

/**
 * @description إنشاء مورد جديد في قاعدة البيانات
 * @permission suppliers.create
 */
async function createSupplier(request) {
    try {
        const body = await request.json();
        const { name, phone, email, address, credit_limit = 0, discount_rate = 0, opening_balance = 0, custom_fields = {} } = body;
        if (!name) {
            return NextResponse.json({ success: false, error: 'اسم المورد مطلوب.' }, { status: 400 });
        }
        const result = await db.query(
            `INSERT INTO suppliers (name, phone, email, address, credit_limit, discount_rate, current_balance, balance_status, custom_fields, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW()) RETURNING *`,
            [
                name,
                phone,
                email,
                address,
                credit_limit,
                discount_rate,
                opening_balance,
                opening_balance > 0 ? 'debtor' : opening_balance < 0 ? 'creditor' : 'balanced',
                JSON.stringify(custom_fields)
            ]
        );
        return NextResponse.json({ success: true, message: 'تم إنشاء المورد بنجاح.', supplier: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('API_SUPPLIERS_POST_ERROR:', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ أثناء إنشاء المورد.' }, { status: 500 });
    }
}

/**
 * @description حذف مورد (أرشفة)
 * @permission suppliers.delete
 */
async function deleteSupplier(request) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) {
            return NextResponse.json({ success: false, error: 'معرف المورد مطلوب.' }, { status: 400 });
        }
        // الحذف المنطقي (أرشفة)
        await db.query('UPDATE suppliers SET deleted_at = NOW(), is_active = false WHERE id = $1', [id]);
        return NextResponse.json({ success: true, message: 'تم حذف المورد بنجاح.' });
    } catch (error) {
        console.error('API_SUPPLIERS_DELETE_ERROR:', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ أثناء حذف المورد.' }, { status: 500 });
    }
}

export const GET = withAuth(getSuppliers, 'suppliers.view');
export const POST = withAuth(createSupplier, 'suppliers.create');
export const DELETE = withAuth(deleteSupplier, 'suppliers.delete');