import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/journal-entries - ��� ���� �������
export async function GET(request) {
  try {
    const entries = await db.query('SELECT * FROM journal_entries ORDER BY entry_date DESC, id DESC');
    return NextResponse.json({ success: true, entries: entries.rows });
  } catch (error) {
    console.error('API_JOURNAL_GET_ERROR:', error);
    return NextResponse.json({ success: false, error: '��� �� ��� ������' }, { status: 500 });
  }
}

// POST /api/journal-entries - ����� ��� ����� ����
export async function POST(request) {
  try {
    const body = await request.json();
    const { entry_number, entry_date, description, created_by, lines } = body;
    if (!entry_number || !entry_date || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ success: false, error: '���� ������ �������� ������' }, { status: 400 });
    }
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const entryResult = await client.query(
        `INSERT INTO journal_entries (entry_number, entry_date, description, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [entry_number, entry_date, description, created_by]
      );
      const entryId = entryResult.rows[0].id;
      for (const line of lines) {
        await client.query(
          `INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
           VALUES ($1, $2, $3, $4, $5)`,
          [entryId, line.account_id, line.description, line.debit || 0, line.credit || 0]
        );
      }
      await client.query('COMMIT');
      return NextResponse.json({ success: true, entry: entryResult.rows[0] });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('API_JOURNAL_POST_ERROR:', error);
    return NextResponse.json({ success: false, error: '��� �� ����� �����' }, { status: 500 });
  }
}
