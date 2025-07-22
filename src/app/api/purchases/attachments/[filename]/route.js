import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime';

const UPLOAD_DIR = path.join(process.cwd(), 'storage');

export async function GET(request, { params }) {
    // في تطبيق حقيقي، يجب التحقق من صلاحيات المستخدم هنا
    // على سبيل المثال، هل يحق للمستخدم الحالي رؤية هذه الفاتورة؟
    // const session = await getSession();
    // const hasPermission = await checkUserPermissionForInvoice(session.user.id, params.filename);
    // if (!hasPermission) {
    //     return new NextResponse('Unauthorized', { status: 403 });
    // }

    try {
        const { filename } = params;

        // تنقية اسم الملف لمنع هجمات Path Traversal
        const sanitizedFilename = path.basename(filename);
        if (sanitizedFilename !== filename) {
            return new NextResponse('Invalid filename', { status: 400 });
        }

        const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

        // التأكد من وجود الملف
        await fs.access(filePath);

        const fileBuffer = await fs.readFile(filePath);
        const contentType = mime.getType(filePath) || 'application/octet-stream';

        return new Response(fileBuffer, {
            headers: { 'Content-Type': contentType },
        });

    } catch (error) {
        console.error('[API Get Attachment Error]', error);
        // إخفاء تفاصيل الخطأ عن المستخدم النهائي
        return new NextResponse('File not found or access denied', { status: 404 });
    }
}