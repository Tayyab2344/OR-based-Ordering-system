'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Order } from '@/lib/types';
import { getOrders, formatPrice, initializeData } from '@/lib/storage';
import { sampleMenuItems, sampleTables, sampleOrders, sampleDailyStats } from '@/lib/data';
import styles from './admin.module.css';

export default function AdminDashboard() {
    const pathname = usePathname();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        avgOrderTime: 12
    });

    useEffect(() => {
        initializeData(sampleMenuItems, sampleTables, sampleOrders);
        const allOrders = getOrders();
        setOrders(allOrders);

        // Calculate stats
        const today = new Date().toDateString();
        const todayOrders = allOrders.filter(o =>
            new Date(o.createdAt).toDateString() === today
        );

        setStats({
            todayOrders: todayOrders.length || sampleDailyStats[sampleDailyStats.length - 1].orders,
            todayRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0) || sampleDailyStats[sampleDailyStats.length - 1].revenue,
            pendingOrders: allOrders.filter(o => o.status === 'pending').length,
            avgOrderTime: 12
        });
    }, []);

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/orders', label: 'Orders', icon: '📋', badge: stats.pendingOrders },
        { href: '/admin/tables', label: 'Tables', icon: '🍽️' },
        { href: '/admin/menu', label: 'Menu', icon: '📖' },
        { href: '/admin/analytics', label: 'Analytics', icon: '📈' }
    ];

    return (
        <div className={styles.adminLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>⚡</div>
                    <span className={styles.logoText}>Neon Bites</span>
                </div>

                <nav className={styles.navSection}>
                    <div className={styles.navLabel}>Main Menu</div>
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className={styles.navBadge}>{item.badge}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                <nav className={styles.navSection}>
                    <div className={styles.navLabel}>Quick Links</div>
                    <Link href="/" className={styles.navItem}>
                        <span className={styles.navIcon}>🏠</span>
                        <span>Customer View</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.headerTitle}>Dashboard</h1>
                        <p className={styles.headerSubtitle}>Welcome back! Here&apos;s what&apos;s happening today.</p>
                    </div>
                    <button className="btn btn-primary">
                        + New Order
                    </button>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            <span>📦</span>
                            Today&apos;s Orders
                        </div>
                        <div className={styles.statValue}>{stats.todayOrders}</div>
                        <div className={`${styles.statChange} ${styles.positive}`}>
                            +12% from yesterday
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            <span>💰</span>
                            Today&apos;s Revenue
                        </div>
                        <div className={styles.statValue}>{formatPrice(stats.todayRevenue)}</div>
                        <div className={`${styles.statChange} ${styles.positive}`}>
                            +8% from yesterday
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            <span>⏱️</span>
                            Pending Orders
                        </div>
                        <div className={styles.statValue}>{stats.pendingOrders}</div>
                        <div className={styles.statChange}>
                            Needs attention
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            <span>⚡</span>
                            Avg. Order Time
                        </div>
                        <div className={styles.statValue}>{stats.avgOrderTime}m</div>
                        <div className={`${styles.statChange} ${styles.positive}`}>
                            -2 min from last week
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className={styles.ordersSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent Orders</h2>
                        <Link href="/admin/orders" className="btn btn-secondary btn-sm">
                            View All →
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                        {orders.slice(0, 4).map(order => (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderCardHeader}>
                                    <div className={styles.tableNumber}>
                                        <span className={styles.tableIcon}>🍽️</span>
                                        Table {order.tableNumber}
                                    </div>
                                    <span className={styles.orderTime}>
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={styles.orderItems}>
                                    {order.items.slice(0, 3).map(item => (
                                        <div key={item.id} className={styles.orderItem}>
                                            {item.quantity}x {item.menuItem.name}
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className={styles.orderItem}>
                                            +{order.items.length - 3} more items
                                        </div>
                                    )}
                                </div>
                                <div className={styles.orderTotal}>
                                    <span>Total</span>
                                    <span className={styles.orderTotalValue}>{formatPrice(order.total)}</span>
                                </div>
                                <div className={styles.orderActions}>
                                    <span
                                        className={`badge badge-${order.status === 'pending' ? 'warning' : order.status === 'preparing' ? 'primary' : 'success'}`}
                                        style={{
                                            background: order.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' :
                                                order.status === 'preparing' ? 'rgba(59, 130, 246, 0.2)' :
                                                    'rgba(34, 197, 94, 0.2)',
                                            color: order.status === 'pending' ? 'var(--warning)' :
                                                order.status === 'preparing' ? '#3b82f6' :
                                                    'var(--success)',
                                            padding: 'var(--space-2) var(--space-3)',
                                            borderRadius: 'var(--radius-md)',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
