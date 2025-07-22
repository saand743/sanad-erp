import { db } from '@/lip/db';
import { NextResponse } from 'next/server';
import { logActivity } from '../../audit-log/service';

// جلب المستخدم الحالي وصلاحياته (نفس المنطق الحالي)
async function getCurrentUser(request) {
    // في تطبيق حقيقي، يتم فك تشفير التوكن هنا
    return { id: 1, name: 'Admin User', permissions: { roles: { view: true, create: true, edit: true, delete: true, assign: true }, users: { view: true } } };
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { action } = body;
        const user = await getCurrentUser(request);

        switch (action) {
            case 'list_roles':
                if (!user.permissions?.roles?.view) return NextResponse.json({ success: false, error: 'غير مصرح لك بعرض الأدوار' }, { status: 403 });
                return await handleListRoles();
            case 'list_users':
                if (!user.permissions?.users?.view) return NextResponse.json({ success: false, error: 'غير مصرح لك بعرض المستخدمين' }, { status: 403 });
                return await handleListUsers();
            case 'create_role':
                if (!user.permissions?.roles?.create) return NextResponse.json({ success: false, error: 'غير مصرح لك بإنشاء الأدوار' }, { status: 403 });
                return await handleCreateRole(body, user);
            case 'update_permissions':
                if (!user.permissions?.roles?.edit) return NextResponse.json({ success: false, error: 'غير مصرح لك بتعديل الأدوار' }, { status: 403 });
                return await handleUpdatePermissions(body, user);
            case 'assign_user':
                if (!user.permissions?.roles?.assign) return NextResponse.json({ success: false, error: 'غير مصرح لك بربط المستخدمين' }, { status: 403 });
                return await handleAssignUserToRole(body, user);
            case 'delete_role':
                if (!user.permissions?.roles?.delete) return NextResponse.json({ success: false, error: 'غير مصرح لك بحذف الأدوار' }, { status: 403 });
                return await handleDeleteRole(body, user);
            default:
                return NextResponse.json({ success: false, error: 'الإجراء غير معروف' }, { status: 400 });
        }
    } catch (error) {
        console.error('[API Roles Error]', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم: ' + error.message }, { status: 500 });
    }
}

async function handleListRoles() {
    const rolesResult = await db.query('SELECT * FROM roles ORDER BY created_at ASC');
    const usersResult = await db.query('SELECT role_id FROM users');
    const rolesWithUserCount = rolesResult.rows.map(role => ({
        ...role,
        users_count: usersResult.rows.filter(u => u.role_id === role.id).length
    }));
    return NextResponse.json({ success: true, roles: rolesWithUserCount });
}

async function handleListUsers() {
    const usersResult = await db.query('SELECT id, full_name, email, role_id FROM users');
    const rolesResult = await db.query('SELECT id, name_ar FROM roles');
    const usersWithRoles = usersResult.rows.map(user => {
        const role = rolesResult.rows.find(r => r.id === user.role_id);
        return { ...user, role_name: role ? role.name_ar : 'لا يوجد دور' };
    });
    return NextResponse.json({ success: true, users: usersWithRoles });
}

async function handleCreateRole(body, user) {
    const { name, name_ar, description, permissions } = body;
    if (!name || !name_ar) {
        return NextResponse.json({ success: false, error: 'اسم الدور باللغتين مطلوب' }, { status: 400 });
    }
    // تحقق من عدم تكرار الاسم
    const exists = await db.query('SELECT id FROM roles WHERE name = $1', [name]);
    if (exists.rowCount > 0) {
        return NextResponse.json({ success: false, error: 'اسم الدور (بالإنجليزية) موجود بالفعل.' }, { status: 409 });
    }
    const newRoleResult = await db.query(
        `INSERT INTO roles (name, name_ar, description, permissions, is_system_role)
         VALUES ($1, $2, $3, $4, false)
         RETURNING *`,
        [name, name_ar, description, JSON.stringify(permissions || {})]
    );
    const newRole = newRoleResult.rows[0];
    await logActivity({
        user_id: user.id,
        user_name: user.name,
        action: 'CREATE_ROLE',
        entity_type: 'Role',
        entity_id: newRole.id,
        details: `إنشاء دور جديد: ${name_ar}`
    });
    return NextResponse.json({ success: true, message: 'تم إنشاء الدور بنجاح', role: newRole });
}

async function handleUpdatePermissions(body, user) {
    const { roleId, permissions } = body;
    const roleResult = await db.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    if (roleResult.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'الدور غير موجود' }, { status: 404 });
    }
    await db.query('UPDATE roles SET permissions = $1 WHERE id = $2', [JSON.stringify(permissions), roleId]);
    await logActivity({
        user_id: user.id,
        user_name: user.name,
        action: 'UPDATE_ROLE_PERMISSIONS',
        entity_type: 'Role',
        entity_id: roleId,
        details: `تحديث صلاحيات الدور: ${roleResult.rows[0].name_ar}`
    });
    return NextResponse.json({ success: true, message: 'تم تحديث الصلاحيات بنجاح' });
}

async function handleAssignUserToRole(body, user) {
    const { userId, roleId } = body;
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }
    const roleResult = await db.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    if (roleResult.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'الدور غير موجود' }, { status: 404 });
    }
    await db.query('UPDATE users SET role_id = $1 WHERE id = $2', [roleId, userId]);
    await logActivity({
        user_id: user.id,
        user_name: user.name,
        action: 'ASSIGN_ROLE_TO_USER',
        entity_type: 'User',
        entity_id: userId,