'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string, name: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('spine_scout_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const signup = async (email: string, password: string, name: string): Promise<boolean> => {
        try {
            // Get existing users
            const usersData = localStorage.getItem('spine_scout_users');
            const users = usersData ? JSON.parse(usersData) : {};

            // Check if user already exists
            if (users[email]) {
                return false;
            }

            // Store new user
            users[email] = { password, name };
            localStorage.setItem('spine_scout_users', JSON.stringify(users));

            // Log in the user
            const newUser = { email, name };
            setUser(newUser);
            localStorage.setItem('spine_scout_user', JSON.stringify(newUser));
            return true;
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const usersData = localStorage.getItem('spine_scout_users');
            const users = usersData ? JSON.parse(usersData) : {};

            if (users[email] && users[email].password === password) {
                const loggedInUser = { email, name: users[email].name };
                setUser(loggedInUser);
                localStorage.setItem('spine_scout_user', JSON.stringify(loggedInUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('spine_scout_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
