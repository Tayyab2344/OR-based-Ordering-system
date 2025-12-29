'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Order, OrderStatus } from '@/lib/types';
import { getOrders, updateOrderStatus, formatPrice, onStorageChange } from '@/lib/storage';
import styles from '../admin.module.css';

const statusColumns: { status: OrderStatus; label: string; color: string }[] = [
    { status: 'pending', label: 'Pending', color: 'var(--warning)' },
    { status: 'preparing', label: 'Preparing', color: '#3b82f6' },
    { status: 'ready', label: 'Ready', color: 'var(--success)' },
    { status: 'served', label: 'Served', color: 'var(--text-muted)' }
];

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
    pending: 'preparing',
    accepted: 'preparing',
    preparing: 'ready',
    ready: 'served',
    served: null,
    cancelled: null
};

export default function OrdersPage() {
    const pathname = usePathname();
    const [orders, setOrders] = useState<Order[]>([]);

    const loadOrders = () => {
        const allOrders = getOrders();
        setOrders(allOrders);
    };

    useEffect(() => {
        loadOrders();

        // Listen for changes
        const unsubscribe = onStorageChange((key) => {
            if (key.includes('orders')) {
                loadOrders();
            }
        });

        // Poll every 3 seconds
        const interval = setInterval(loadOrders, 3000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        updateOrderStatus(orderId, newStatus);
        loadOrders();
    };

    const pendingCount = orders.filter(o => o.status === 'pending').length;

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/orders', label: 'Orders', icon: '📋', badge: pendingCount },
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
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.headerTitle}>Orders</h1>
                        <p className={styles.headerSubtitle}>Manage and track all incoming orders</p>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className={styles.kanbanBoard}>
                    {statusColumns.map(column => {
                        const columnOrders = orders.filter(o => o.status === column.status);

                        return (
                            <div key={column.status} className={styles.kanbanColumn}>
                                <div className={styles.columnHeader}>
                                    <div className={styles.columnTitle}>
                                        <span
                                            className={styles.columnDot}
                                            style={{ background: column.color }}
                                        />
                                        {column.label}
                                    </div>
                                    <span className={styles.columnCount}>{columnOrders.length}</span>
                                </div>

                                <div className={styles.orderCards}>
                                    {columnOrders.map(order => (
                                        <div key={order.id} className={styles.orderCard}>
                                            <div className={styles.orderCardHeader}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 'var(--space-2)' }}>
                                                    <div className={styles.tableNumber}>
                                                        <span className={styles.tableIcon}>🍽️</span>
                                                        Table {order.tableNumber}
                                                    </div>
                                                    <span className={styles.orderTime}>
                                                        {new Date(order.createdAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--text-secondary)',
                                                    background: 'var(--bg-tertiary)',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    display: 'inline-block'
                                                }}>
                                                    💳 {order.paymentMethod}
                                                </div>
                                            </div>

                                            <div className={styles.orderItems}>
                                                {order.items.map(item => (
                                                    <div key={item.id} className={styles.orderItem}>
                                                        {item.quantity}x {item.menuItem.name}
                                                        {item.selectedExtras.length > 0 && (
                                                            <span style={{ color: 'var(--text-muted)' }}>
                                                                {' '}({item.selectedExtras.map(e => e.name).join(', ')})
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className={styles.orderTotal}>
                                                <span>Total</span>
                                                <span className={styles.orderTotalValue}>
                                                    {formatPrice(order.total)}
                                                </span>
                                            </div>

                                            {nextStatus[order.status] && (
                                                <div className={styles.orderActions}>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleStatusChange(order.id, nextStatus[order.status]!)}
                                                        style={{ width: '100%' }}
                                                    >
                                                        {order.status === 'pending' && 'Start Preparing →'}
                                                        {order.status === 'preparing' && 'Mark Ready →'}
                                                        {order.status === 'ready' && 'Mark Served →'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {columnOrders.length === 0 && (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: 'var(--space-6)',
                                            color: 'var(--text-muted)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}>
                                            No orders
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
