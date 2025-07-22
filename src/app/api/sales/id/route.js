import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // 1. جلب بيانات الفاتورة الرئيسية وبيانات العميل
    const invoiceQuery = `
      SELECT 
        si.id, si.invoice_number, si.total_amount, si.invoice_date, si.status,
        c.name as customer_name, c.address as customer_address, c.tax_number as customer_tax_number
      FROM sales_invoices si
      JOIN customers c ON si.customer_id = c.id
      WHERE si.id = $1;
    `;
    const invoiceResult = await db.query(invoiceQuery, [id]);

    if (invoiceResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'الفاتورة غير موجودة' }, { status: 404 });
    }

    const invoice = invoiceResult.rows[0];

    // 2. جلب بنود الفاتورة وبيانات المنتجات
    const itemsQuery = `
      SELECT 
        sii.quantity, sii.unit_price, sii.total_price,
        p.name as product_name
      FROM sales_invoice_items sii
      JOIN products p ON sii.product_id = p.id
      WHERE sii.sales_invoice_id = $1;
    `;
    const itemsResult = await db.query(itemsQuery, [id]);
    invoice.items = itemsResult.rows;

    return NextResponse.json({ success: true, invoice });

  } catch (error) {
    console.error('API_SALES_GET_SINGLE_ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب بيانات الفاتورة' },
      { status: 500 }
    );
  }
}