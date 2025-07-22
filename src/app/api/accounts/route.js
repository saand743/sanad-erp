import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/accounts - Ã·» ‘Ã—… «·Õ”«»« 
export async function GET(request) {
  try {
    const accounts = await db.query('SELECT * FROM accounts ORDER BY code ASC');
    return NextResponse.json({ success: true, accounts: accounts.rows });
  } catch (error) {
    console.error('API_ACCOUNTS_GET_ERROR:', error);
    return NextResponse.json({ success: false, error: '›‘· ›Ì Ã·» «·Õ”«»« ' }, { status: 500 });
  }
}

// POST /api/accounts - ≈÷«›… Õ”«» ÃœÌœ
export async function POST(request) {
  try {
    const body = await request.json();
    const { parent_id, code, name_ar, name_en, type, is_active, level } = body;
    if (!code || !name_ar || !type) {
      return NextResponse.json({ success: false, error: 'Ã„Ì⁄ «·ÕﬁÊ· «·√”«”Ì… „ÿ·Ê»…' }, { status: 400 });
    }
    const result = await db.query(
      `INSERT INTO accounts (parent_id, code, name_ar, name_en, type, is_active, level)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [parent_id || null, code, name_ar, name_en, type, is_active ?? true, level || 1]
    );
    return NextResponse.json({ success: true, account: result.rows[0] });
  } catch (error) {
    console.error('API_ACCOUNTS_POST_ERROR:', error);
    return NextResponse.json({ success: false, error: '›‘· ›Ì ≈÷«›… «·Õ”«»' }, { status: 500 });
  }
}
