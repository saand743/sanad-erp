import { db } from '@/lip/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const audits = await db.query(`
      SELECT * FROM inventory_audits ORDER BY created_at DESC
    `);
    return NextResponse.json({ success: true, audits: audits.rows });
  } catch (error) {
    console.error('API_AUDITS_GET_ERROR:', error);
    return NextResponse.json({ success: false, error: 'فشل في جلب عمليات الجرد' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { count_type, notes, user_id = 1 } = body;

    // Generate a unique count number
    const countResult = await db.query("SELECT COUNT(*) FROM inventory_audits");
    const countNumber = `AUDIT-${new Date().getFullYear()}-${String(parseInt(countResult.rows[0].count, 10) + 1).padStart(4, '0')}`;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const newAudit = await client.query(
        `INSERT INTO inventory_audits (count_number, count_type, status, created_by, notes)
         VALUES ($1, $2, 'in_progress', $3, $4)
         RETURNING *`,
        [countNumber, count_type, user_id, notes]
      );
      const auditId = newAudit.rows[0].id;

      // Populate items for the audit
      await client.query(`
        INSERT INTO inventory_audit_items (audit_id, product_id, product_name, product_code, system_quantity, counted_quantity)
        SELECT $1, id, name, product_code, current_stock, 0
        FROM products
      `, [auditId]);

      await client.query('COMMIT');
      return NextResponse.json({ success: true, count: newAudit.rows[0] }, { status: 201 });

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('API_AUDITS_POST_ERROR:', error);
    return NextResponse.json({ success: false, error: 'فشل في إنشاء عملية الجرد' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { auditId, updates } = body;

    if (!auditId || !updates || !Array.isArray(updates)) {
      return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      for (const item of updates) {
        await client.query(
          `UPDATE inventory_audit_items
           SET counted_quantity = $1, notes = $2, reason = $3
           WHERE audit_id = $4 AND product_id = $5`,
          [item.countedQuantity, item.notes, item.reason, auditId, item.productId]
        );
      }
      await client.query('COMMIT');
      return NextResponse.json({ success: true, message: 'تم تحديث الكميات بنجاح' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('API_AUDITS_UPDATE_ITEMS_ERROR:', error);
    return NextResponse.json({ success: false, error: 'فشل في تحديث بنود الجرد' }, { status: 500 });
  }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { auditId } = body;

        if (!auditId) {
            return NextResponse.json({ success: false, error: 'معرف الجرد مطلوب' }, { status: 400 });
        }

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // Update product stock based on audit results
            await client.query(`
                UPDATE products p
                SET current_stock = i.counted_quantity
                FROM inventory_audit_items i
                WHERE p.id = i.product_id AND i.audit_id = $1 AND i.counted_quantity != i.system_quantity
            `, [auditId]);

            // Mark audit as completed
            await client.query(
                `UPDATE inventory_audits SET status = 'completed', completed_at = NOW() WHERE id = $1`,
                [auditId]
            );

            await client.query('COMMIT');
            
            // Here you would generate and return the completion report
            const reportData = await client.query(`
                SELECT 
                    i.product_id,
                    i.product_name,
                    i.system_quantity,
                    i.counted_quantity,
                    p.purchase_price
                FROM inventory_audit_items i
                JOIN products p ON p.id = i.product_id
                WHERE i.audit_id = $1 AND i.system_quantity != i.counted_quantity
            `, [auditId]);

            const adjustments = reportData.rows.map(item => ({
                productId: item.product_id,
                productName: item.product_name,
                systemQuantity: item.system_quantity,
                countedQuantity: item.counted_quantity,
                difference: item.counted_quantity - item.system_quantity,
                value: (item.counted_quantity - item.system_quantity) * item.purchase_price
            }));

            const totalAdjustmentValue = adjustments.reduce((sum, item) => sum + item.value, 0);

            return NextResponse.json({ 
                success: true, 
                message: 'تم إنهاء عملية الجرد وتحديث المخزون بنجاح.',
                report: {
                    countId: auditId,
                    completedAt: new Date().toISOString(),
                    adjustments,
                    totalAdjustmentValue
                }
            });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('API_AUDITS_COMPLETE_ERROR:', error);
        return NextResponse.json({ success: false, error: 'فشل في إنهاء عملية الجرد' }, { status: 500 });
    }
}