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

export default function KitchenLoginPage() {
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
            await setSessionPersistenceByRole('kitchen');
            const userCredential = await signInWithEmailAndPassword(auth, email, password).catch(err => {
                if (err.code === 'auth/invalid-credential') {
                    throw new Error('Invalid email or password. Please try again.');
                }
                throw err;
            });

            const uid = userCredential.user.uid;

            const userDoc = await getDoc(doc(db, 'users', uid));
            if (!userDoc.exists()) {
                await auth.signOut();
                setError('Access denied. Please contact admin.');
                setLoading(false);
                return;
            }

            const role = userDoc.data().role;
            if (role !== 'kitchen' && role !== 'admin') {
                await auth.signOut();
                setError('Access denied. Kitchen credentials required.');
                setLoading(false);
                return;
            }

            // Don't let timestamp recording block the transition if it takes too long
            try {
                await Promise.race([
                    recordLoginTimestamp(uid),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
                ]);
            } catch (tsError) {
                console.warn('Logging session timestamp failed/timed out, proceeding anyway:', tsError);
            }

            router.push('/kitchen');
        } catch (err: any) {
            console.error('Kitchen login error:', err);
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.splitContainer}>
            {/* Left Side - Image Panel */}
            <div className={styles.imagePanel} style={{
                background: `linear-gradient(135deg, rgba(244, 130, 34, 0.15) 0%, rgba(0, 0, 0, 0.95) 100%),
                url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80') center/cover no-repeat`
            }}>
                <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
                    <ThemeToggle />
                </div>
                <div className={styles.decorativeAccent}></div>
                <div className={styles.imageContent}>
                    <div className={styles.brandBadge}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                            <path d="M7 2v20" />
                            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                        </svg>
                        <span>Kitchen Display System</span>
                    </div>
                    <h2 className={styles.imageTitle}>
                        Kitchen<br />
                        <span>Control Station</span>
                    </h2>
                    <p className={styles.imageSubtitle}>
                        View incoming orders, manage preparation workflow, and ensure timely delivery with our streamlined kitchen display system.
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
                        <h1 className={styles.title}>Kitchen Portal</h1>
                        <p className={styles.subtitle}>Sign in to start your shift</p>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="kitchen@abbottabadeats.com"
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

                        <button
                            type="submit"
                            className={styles.button}
                            disabled={loading}
                        >
                            {loading ? 'Starting Shift...' : 'Start Shift'}
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

                    <a href="/admin/login" className={styles.backLink}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Switch to Admin Portal
                    </a>
                </div>
            </div>
        </div>
    );
}
