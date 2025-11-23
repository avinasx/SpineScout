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
        console.log('[Auth] Checking for existing session...');
        const storedUser = localStorage.getItem('spine_scout_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            console.log('[Auth] Session restored for user:', user.email);
            setUser(user);
        } else {
            console.log('[Auth] No existing session found');
        }
        setIsLoading(false);
    }, []);

    const signup = async (email: string, password: string, name: string): Promise<boolean> => {
        try {
            // Normalize inputs
            const normalizedEmail = email.trim().toLowerCase();
            const trimmedPassword = password.trim();
            const trimmedName = name.trim();

            console.log('[Auth] Signup attempt:', { email: normalizedEmail, name: trimmedName });

            // Get existing users
            const usersData = localStorage.getItem('spine_scout_users');
            const users = usersData ? JSON.parse(usersData) : {};
            console.log('[Auth] Existing users count:', Object.keys(users).length);

            // Check if user already exists
            if (users[normalizedEmail]) {
                console.log('[Auth] Signup failed: User already exists');
                return false;
            }

            // Store new user
            users[normalizedEmail] = { password: trimmedPassword, name: trimmedName };
            localStorage.setItem('spine_scout_users', JSON.stringify(users));
            console.log('[Auth] User saved to localStorage');

            // Verify the save
            const verifyUsers = localStorage.getItem('spine_scout_users');
            const parsedVerify = verifyUsers ? JSON.parse(verifyUsers) : {};
            if (!parsedVerify[normalizedEmail]) {
                console.error('[Auth] ERROR: User not found after save!');
                return false;
            }
            console.log('[Auth] Verification successful - user exists in localStorage');

            // Log in the user
            const newUser = { email: normalizedEmail, name: trimmedName };
            setUser(newUser);
            localStorage.setItem('spine_scout_user', JSON.stringify(newUser));
            console.log('[Auth] User logged in and session saved');
            return true;
        } catch (error) {
            console.error('[Auth] Signup error:', error);
            return false;
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // Normalize inputs
            const normalizedEmail = email.trim().toLowerCase();
            const trimmedPassword = password.trim();

            console.log('[Auth] Login attempt:', { email: normalizedEmail });

            const usersData = localStorage.getItem('spine_scout_users');
            const users = usersData ? JSON.parse(usersData) : {};
            console.log('[Auth] Total users in database:', Object.keys(users).length);
            console.log('[Auth] All registered emails:', Object.keys(users));

            if (users[normalizedEmail]) {
                console.log('[Auth] User found in database');
                if (users[normalizedEmail].password === trimmedPassword) {
                    console.log('[Auth] Password match - login successful');
                    const loggedInUser = { email: normalizedEmail, name: users[normalizedEmail].name };
                    setUser(loggedInUser);
                    localStorage.setItem('spine_scout_user', JSON.stringify(loggedInUser));
                    return true;
                } else {
                    console.log('[Auth] Login failed: Incorrect password');
                }
            } else {
                console.log('[Auth] Login failed: User not found');
            }
            return false;
        } catch (error) {
            console.error('[Auth] Login error:', error);
            return false;
        }
    };

    const logout = () => {
        console.log('[Auth] Logging out user');
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
