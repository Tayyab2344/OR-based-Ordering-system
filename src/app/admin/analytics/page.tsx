'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { sampleDailyStats, samplePopularItems, sampleTableStats, sampleTables } from '@/lib/data';
import { formatPrice } from '@/lib/storage';
import styles from '../admin.module.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

export default function AnalyticsPage() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/orders', label: 'Orders', icon: '📋' },
        { href: '/admin/tables', label: 'Tables', icon: '🍽️' },
        { href: '/admin/menu', label: 'Menu', icon: '📖' },
        { href: '/admin/analytics', label: 'Analytics', icon: '📈' }
    ];

    // Daily Orders Chart Data
    const dailyOrdersData = {
        labels: sampleDailyStats.map(stat => {
            const date = new Date(stat.date);
            return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: 'Orders',
                data: sampleDailyStats.map(stat => stat.orders),
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2,
                borderRadius: 8,
                tension: 0.4
            }
        ]
    };

    // Revenue Chart Data
    const revenueData = {
        labels: sampleDailyStats.map(stat => {
            const date = new Date(stat.date);
            return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: 'Revenue (PKR)',
                data: sampleDailyStats.map(stat => stat.revenue),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(34, 197, 94)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }
        ]
    };

    // Popular Items Chart Data
    const popularItemsData = {
        labels: samplePopularItems.map(item => item.name),
        datasets: [
            {
                label: 'Orders',
                data: samplePopularItems.map(item => item.orderCount),
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(34, 197, 94, 0.5)',
                    'rgba(34, 197, 94, 0.4)'
                ],
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
                borderRadius: 8
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)'
                }
            }
        }
    };

    const horizontalChartOptions = {
        ...chartOptions,
        indexAxis: 'y' as const
    };

    // Get heatmap color based on order count
    const getHeatmapColor = (count: number) => {
        const maxCount = Math.max(...sampleTableStats.map(t => t.orderCount));
        const intensity = count / maxCount;

        if (intensity > 0.8) return 'rgba(34, 197, 94, 0.9)';
        if (intensity > 0.6) return 'rgba(34, 197, 94, 0.7)';
        if (intensity > 0.4) return 'rgba(34, 197, 94, 0.5)';
        if (intensity > 0.2) return 'rgba(34, 197, 94, 0.3)';
        return 'rgba(34, 197, 94, 0.15)';
    };

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
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.headerTitle}>Analytics</h1>
                        <p className={styles.headerSubtitle}>Track performance and insights</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-secondary">Last 7 Days</button>
                        <button className="btn btn-secondary">Export</button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>📦 Total Orders (7 days)</div>
                        <div className={styles.statValue}>
                            {sampleDailyStats.reduce((sum, s) => sum + s.orders, 0)}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>💰 Total Revenue (7 days)</div>
                        <div className={styles.statValue}>
                            {formatPrice(sampleDailyStats.reduce((sum, s) => sum + s.revenue, 0))}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>📈 Avg Orders/Day</div>
                        <div className={styles.statValue}>
                            {Math.round(sampleDailyStats.reduce((sum, s) => sum + s.orders, 0) / 7)}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>🎯 Best Day</div>
                        <div className={styles.statValue}>
                            {sampleDailyStats.reduce((max, s) => s.orders > max.orders ? s : max).orders} orders
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                    {/* Daily Orders Chart */}
                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>Daily Orders</h3>
                        <div style={{ height: '300px' }}>
                            {mounted && <Bar data={dailyOrdersData} options={chartOptions} />}
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>Daily Revenue</h3>
                        <div style={{ height: '300px' }}>
                            {mounted && <Line data={revenueData} options={chartOptions} />}
                        </div>
                    </div>
                </div>

                {/* Second Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                    {/* Popular Items */}
                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>Most Popular Items</h3>
                        <div style={{ height: '300px' }}>
                            {mounted && <Bar data={popularItemsData} options={horizontalChartOptions} />}
                        </div>
                    </div>

                    {/* Table Heatmap */}
                    <div className={styles.chartContainer}>
                        <h3 className={styles.chartTitle}>Table Usage Heatmap</h3>
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--text-muted)',
                            marginBottom: 'var(--space-4)'
                        }}>
                            Darker = More orders
                        </p>
                        <div className={styles.heatmapGrid}>
                            {sampleTableStats.slice(0, 15).map(tableStat => (
                                <div
                                    key={tableStat.tableId}
                                    className={styles.heatmapCell}
                                    style={{
                                        background: getHeatmapColor(tableStat.orderCount),
                                        color: tableStat.orderCount > 20 ? '#000' : 'var(--text-primary)'
                                    }}
                                    title={`Table ${tableStat.tableId}: ${tableStat.orderCount} orders`}
                                >
                                    {tableStat.tableId}
                                </div>
                            ))}
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 'var(--space-4)',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--text-muted)'
                        }}>
                            <span>Low Activity</span>
                            <span>High Activity</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
