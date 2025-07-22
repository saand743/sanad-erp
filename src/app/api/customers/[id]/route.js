import { db } from '@/lip/db';
import { NextResponse } from 'next/server';

// GET /api/customers/[id] - جلب عميل واحد
export async function GET(request, { params }) {
    try {
        const { id } = params;
        const result = await db.query('SELECT * FROM customers WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, error: 'العميل غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ success: true, customer: result.rows[0] });
    } catch (error) {
        console.error('API_CUSTOMER_GET_ERROR:', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب العميل' }, { status: 500 });
    }
}


// PUT /api/customers/[id] - تحديث عميل
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, phone, address, email, customer_code } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 });
    }

    const result = await db.query(
      `UPDATE customers 
       SET name = $1, phone = $2, address = $3, email = $4, customer_code = $5
       WHERE id = $6 RETURNING *`,
      [name, phone, address, email, customer_code, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'العميل غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer: result.rows[0] });
  } catch (error)
  {
    console.error('API_CUSTOMER_UPDATE_ERROR:', error);
    if (error.code === '23505') { // unique_violation
        return NextResponse.json({ success: false, error: 'كود العميل أو رقم الهاتف موجود بالفعل.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء تحديث العميل' }, { status: 500 });
  }
}

// DELETE /api/customers/[id] - حذف عميل
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        
        const invoices = await db.query('SELECT id FROM sales_invoices WHERE customer_id = $1 LIMIT 1', [id]);
        if (invoices.rowCount > 0) {
            return NextResponse.json({ success: false, error: 'لا يمكن حذف العميل لوجود فواتير مرتبطة به.' }, { status: 400 });
        }

        const result = await db.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, error: 'العميل غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'تم حذف العميل بنجاح' });
    } catch (error) {
        console.error('API_CUSTOMER_DELETE_ERROR:', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ أثناء حذف العميل' }, { status: 500 });
    }
}