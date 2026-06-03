import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import api from '../config/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderCounts, setOrderCounts] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const stored = localStorage.getItem('auth_user');
        if (token && stored) {
            setUser(JSON.parse(stored));
        }
        setLoading(false);
    }, []);

    const addOrderCount = (username) => {
        setOrderCounts(prev => ({ ...prev, [username]: (prev[username] ?? 0) + 1 }));
    };

    const rankedCustomers = [];

    const handleSignUp = async (userData) => {
        try {
            await api.post('/auth/signup', {
                name:     userData.name,
                username: userData.username,
                email:    userData.email,
                password: userData.password,
                phone:    userData.phone,
            });
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || '';
            if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('username')) {
                return false;
            }
            return false;
        }
    };

    const handleSignIn = async (username, password) => {
        try {
            const res = await api.post('/auth/signin', { username, password });
            const { token, user: userData } = res.data;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch {
            return false;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, handleSignIn, handleSignUp, handleLogout, orderCounts, addOrderCount, rankedCustomers }}>
            {children}
        </AuthContext.Provider>
    );
};
