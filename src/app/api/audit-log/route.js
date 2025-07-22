import { NextResponse } from 'next/server';
import { getLogs } from './service';

// Mock user check
async function getCurrentUser(request) {
    // In a real app, you'd validate a JWT or session
    return { id: 1, name: 'Admin User', permissions: { audit_log: { view: true } } };
}

export async function POST(request) {
    try {
        const user = await getCurrentUser(request);

        // Permission check
        if (!user?.permissions?.audit_log?.view) {
            return NextResponse.json({ success: false, error: 'غير مصرح لك بعرض سجل النشاطات' }, { status: 403 });
        }

        const body = await request.json();
        const { page = 1, limit = 15, ...filters } = body;

        const { logs } = await getLogs(filters);

        const total_records = logs.length;
        const total_pages = Math.ceil(total_records / limit);
        const paginatedLogs = logs.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
            success: true,
            logs: paginatedLogs,
            pagination: {
                current_page: page,
                total_pages,
                total_records,
                has_next: page < total_pages,
                has_previous: page > 1,
            },
        });

    } catch (error) {
        console.error('[API Audit Log Error]', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم: ' + error.message }, { status: 500 });
    }
}