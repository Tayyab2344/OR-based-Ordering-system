'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { setSessionPersistenceByRole, recordLoginTimestamp } from '@/lib/auth-utils';
import ThemeToggle from '@/components/ThemeToggle';
import BrandIcon from '@/components/BrandIcon';
import { EyeIcon, EyeOffIcon } from '@/components/Icons';
import styles from '../../login/login.module.css';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await setSessionPersistenceByRole('admin');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            const userDoc = await getDoc(doc(db, 'users', uid));
            if (!userDoc.exists() || userDoc.data().role !== 'admin') {
                await auth.signOut();
                setError('Access denied. Admin credentials required.');
                setLoading(false);
                return;
            }

            await recordLoginTimestamp(uid);
            router.push('/admin');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.code === 'auth/network-request-failed') {
                setError('Network error: Unable to connect to Firebase.');
            } else {
                setError(err.message || 'Failed to login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.splitContainer}>
            {/* Left Side - Image Panel */}
            <div className={styles.imagePanel}>
                <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
                    <ThemeToggle />
                </div>
                <div className={styles.decorativeAccent}></div>
                <div className={styles.imageContent}>
                    <div className={styles.brandBadge}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>Admin Dashboard</span>
                    </div>
                    <h2 className={styles.imageTitle}>
                        Restaurant<br />
                        <span>Command Center</span>
                    </h2>
                    <p className={styles.imageSubtitle}>
                        Manage your entire restaurant operations from one powerful dashboard. Track orders, analyze sales, and optimize performance.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className={styles.portalPanel}>
                <div className={styles.portalContent}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logoIcon}>
                            <BrandIcon size={40} />
                        </div>
                        <h1 className={styles.title}>Admin Portal</h1>
                        <p className={styles.subtitle}>Sign in to access your dashboard</p>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@abbottabadeats.com"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? 'Signing in...' : 'Enter Dashboard'}
                        </button>

                        <button
                            type="button"
                            className={styles.linkButton}
                            onClick={() => router.push('/reset-password')}
                        >
                            Forgot Password?
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <a href="/kitchen/login" className={styles.backLink}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                            <path d="M7 2v20" />
                            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                        </svg>
                        Switch to Kitchen Portal
                    </a>
                </div>
            </div>
        </div>
    );
}
