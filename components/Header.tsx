'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-base-100 shadow-lg border-b border-base-300">
            <div className="navbar px-4">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl font-bold">
                        <span className="text-2xl">🦴</span>
                        <span className="text-base-content">Spine Scout</span>
                    </a>
                </div>
                {user && (
                    <div className="flex-none gap-2">
                        <span className="text-sm text-base-content/70 hidden sm:inline">
                            Welcome, {user.name}
                        </span>
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-10">
                                    <span className="text-xl font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
                                <li className="menu-title">
                                    <span className="text-base-content">{user.name}</span>
                                    <span className="text-xs text-base-content/60">{user.email}</span>
                                </li>
                                <li><a onClick={logout} className="text-error">Logout</a></li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
