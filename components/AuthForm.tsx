'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let success = false;
            if (isLogin) {
                success = await login(email, password);
                if (!success) {
                    setError('Invalid email or password');
                }
            } else {
                if (!name.trim()) {
                    setError('Please enter your name');
                    setLoading(false);
                    return;
                }
                success = await signup(email, password, name);
                if (!success) {
                    setError('Email already exists');
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="text-2xl font-bold text-center mb-6 text-base-content">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>

                    <div className="tabs tabs-boxed mb-6">
                        <a
                            className={`tab flex-1 ${isLogin ? 'tab-active' : ''}`}
                            onClick={() => {
                                setIsLogin(true);
                                setError('');
                            }}
                        >
                            Login
                        </a>
                        <a
                            className={`tab flex-1 ${!isLogin ? 'tab-active' : ''}`}
                            onClick={() => {
                                setIsLogin(false);
                                setError('');
                            }}
                        >
                            Sign Up
                        </a>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content/80">Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="input input-bordered w-full bg-base-200 text-base-content"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content/80">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="input input-bordered w-full bg-base-200 text-base-content"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content/80">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="input input-bordered w-full bg-base-200 text-base-content"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            {!isLogin && (
                                <label className="label">
                                    <span className="label-text-alt text-base-content/60">Minimum 6 characters</span>
                                </label>
                            )}
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
