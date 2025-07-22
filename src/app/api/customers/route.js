import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/customers - جلب قائمة العملاء مع دعم للبحث والترقيم
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const all = searchParams.get('all') === 'true';
    const offset = (page - 1) * limit;

    if (all) {
      const allCustomers = await db.query('SELECT id, name FROM customers ORDER BY name ASC');
      return NextResponse.json({ success: true, customers: allCustomers.rows });
    }

    let whereClause = '';
    const values = [];
    let paramIndex = 1;

    if (searchTerm) {
      whereClause = `WHERE name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR customer_code ILIKE $${paramIndex}`;
      values.push(`%${searchTerm}%`);
      paramIndex++;
    }

    const countResult = await db.query(`SELECT COUNT(*) FROM customers ${whereClause}`, searchTerm ? [values[0]] : []);
    const totalCustomers = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCustomers / limit);

    const customersResult = await db.query(
      `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    return NextResponse.json({
      success: true,
      customers: customersResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalCustomers,
      },
    });
  } catch (error) {
    console.error('API_CUSTOMERS_GET_ERROR:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب العملاء' }, { status: 500 });
  }
}

// POST /api/customers - إنشاء عميل جديد
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, address, email, customer_code } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 });
    }

    const newCustomer = await db.query(
      `INSERT INTO customers (name, phone, address, email, customer_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, phone, address, email, customer_code]
    );

    return NextResponse.json({ success: true, customer: newCustomer.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('API_CUSTOMERS_POST_ERROR:', error);
    if (error.code === '23505') { // unique_violation
        return NextResponse.json({ success: false, error: 'كود العميل أو رقم الهاتف موجود بالفعل.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء إنشاء العميل' }, { status: 500 });
  }
}