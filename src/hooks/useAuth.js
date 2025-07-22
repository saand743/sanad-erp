'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    const fetchSession = useCallback(async () => {
        const sessionToken = Cookies.get('token');
        if (!sessionToken) {
            setLoading(false);
            return;
        }
        setToken(sessionToken);
        try {
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${sessionToken}` }
            });
            if (!response.ok) throw new Error('Session invalid');
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                setPermissions(data.permissions);
            } else {
                Cookies.remove('token');
                setUser(null);
                setPermissions({});
            }
        } catch (error) {
            console.error("Auth hook error:", error);
            Cookies.remove('token');
            setUser(null);
            setPermissions({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    const hasPermission = useCallback((permissionString) => {
        if (!permissionString) return true;
        const [module, action] = permissionString.split('.');
        return !!permissions[module]?.[action];
    }, [permissions]);

    return { user, permissions, hasPermission, loading, token };
}