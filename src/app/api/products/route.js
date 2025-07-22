import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const all = searchParams.get('all') === 'true';
    const offset = (page - 1) * limit;

    if (all) {
      const allProducts = await db.query('SELECT * FROM products ORDER BY name ASC');
      return NextResponse.json({ success: true, products: allProducts.rows });
    }

    let whereClause = '';
    const values = [];
    let paramIndex = 1;

    if (searchTerm) {
      whereClause = `WHERE name ILIKE $${paramIndex} OR product_code ILIKE $${paramIndex}`;
      values.push(`%${searchTerm}%`);
      paramIndex++;
    }

    const countResult = await db.query(`SELECT COUNT(*) FROM products ${whereClause}`, searchTerm ? [values[0]] : []);
    const totalProducts = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalProducts / limit);

    const productsResult = await db.query(
      `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    return NextResponse.json({
      success: true,
      products: productsResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
      },
    });
  } catch (error) {
    console.error('API_PRODUCTS_GET_ERROR:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب المنتجات' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, product_code, description, purchase_price, sale_price, current_stock } = body;

    if (!name || !product_code || purchase_price === undefined || sale_price === undefined) {
      return NextResponse.json({ success: false, error: 'البيانات الأساسية للمنتج مطلوبة' }, { status: 400 });
    }

    const newProduct = await db.query(
      `INSERT INTO products (name, product_code, description, purchase_price, sale_price, current_stock)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, product_code, description, purchase_price, sale_price, current_stock || 0]
    );

    return NextResponse.json({ success: true, product: newProduct.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('API_PRODUCTS_POST_ERROR:', error);
    if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'كود المنتج موجود بالفعل.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء إنشاء المنتج' }, { status: 500 });
  }
}

