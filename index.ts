0,0 @@
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; // Use the non-audited connection for SELECT
import { getUserIdFromRequest } from '@/lib/auth';
import { z } from 'zod';

// Schema for validating query parameters
const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(15),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 1. Authentication & Authorization
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    // TODO: Add authorization check, e.g., check if the user has an 'admin' role.
    // const userRole = await getUserRole(userId);
    // if (userRole !== 'admin') {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    // 2. Validate query parameters
    const validation = auditLogQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.flatten().fieldErrors });
    }
    const { page, limit } = validation.data;
    const offset = (page - 1) * limit;

    // 3. Fetch data and total count in parallel
    const [logsResult, totalResult] = await Promise.all([
      db.query(
        `SELECT
          al.id,
          al.action_type,
          al.table_name,
          al.record_id,
          al.old_data,
          al.new_data,
          al.created_at,
          u.email AS user_email -- Assuming users table has an email column
        FROM public.audit_logs al
        LEFT JOIN public.users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      db.query('SELECT COUNT(*) FROM public.audit_logs'),
    ]);

    const logs = logsResult.rows;
    const totalLogs = parseInt(totalResult.rows[0].count, 10);

    // 4. Send response with pagination info
    res.status(200).json({
      data: logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalLogs / limit),
        totalItems: totalLogs,
      },
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}