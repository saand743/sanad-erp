import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * @description دالة وسيطة (Middleware) للتحقق من المصادقة والصلاحيات
 * @param {Function} handler - دالة معالجة الطلب الأصلية
 * @param {string} requiredPermission - الصلاحية المطلوبة للوصول (e.g., 'sales.view')
 * @returns {Function} - دالة معالجة الطلب الجديدة المحمية
 */
export function withAuth(handler, requiredPermission) {
    return async function (request, ...args) {
        try {
            const authHeader = request.headers.get('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return NextResponse.json({ success: false, error: 'Token not provided' }, { status: 401 });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded.userId || !decoded.roleId) {
                return NextResponse.json({ success: false, error: 'Invalid token payload' }, { status: 401 });
            }

            // جلب صلاحيات الدور من قاعدة البيانات
            const roleResult = await db.query('SELECT permissions FROM roles WHERE id = $1', [decoded.roleId]);

            if (roleResult.rowCount === 0) {
                return NextResponse.json({ success: false, error: 'Role not found' }, { status: 403 });
            }

            const permissions = roleResult.rows[0].permissions || {};
            const [module, action] = requiredPermission.split('.');

            // التحقق من الصلاحية
            if (!permissions[module] || !permissions[module][action]) {
                return NextResponse.json({ success: false, error: 'Access Denied: Insufficient permissions' }, { status: 403 });
            }

            // إضافة بيانات المستخدم إلى الطلب لتكون متاحة في المعالج الأصلي
            request.user = { id: decoded.userId, roleId: decoded.roleId, permissions };

            // إذا كان كل شيء على ما يرام، قم بتنفيذ المعالج الأصلي
            return handler(request, ...args);

        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
            }
            console.error('AUTH_MIDDLEWARE_ERROR:', error);
            return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
        }
    };
}