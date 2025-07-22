import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { auditId } = params;
    const { searchParams } = new URL(request.url);
    const cursor = parseInt(searchParams.get('cursor') || '0', 10);
    const limit = 50; // Fetch 50 items at a time

    const items = await db.query(
      `SELECT * FROM inventory_audit_items 
       WHERE audit_id = $1 
       ORDER BY product_name 
       LIMIT $2 OFFSET $3`,
      [auditId, limit, cursor]
    );

    return NextResponse.json({
      success: true,
      items: items.rows,
      nextCursor: items.rows.length === limit ? cursor + limit : null,
    });
  } catch (error) {
    console.error('API_AUDIT_ITEMS_GET_ERROR:', error);
    return NextResponse.json({ success: false, error: 'فشل في جلب بنود الجرد' }, { status: 500 });
  }
}

