import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    // تحديث مرن يسمح بتغيير أي حقل
    const { name, product_code, description, purchase_price, sale_price, current_stock } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف المنتج مطلوب' }, { status: 400 });
    }

    const result = await db.query(
      `UPDATE products 
       SET name = $1, product_code = $2, description = $3, purchase_price = $4, sale_price = $5, current_stock = $6
       WHERE id = $7 RETURNING *`,
      [name, product_code, description, purchase_price, sale_price, current_stock, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'المنتج غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error('API_PRODUCTS_UPDATE_ERROR:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء تحديث المنتج' }, { status: 500 });
  }
}