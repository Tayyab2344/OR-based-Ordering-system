'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem } from '@/lib/types';
import { getMenu, saveMenu, updateMenuItem, formatPrice, initializeData } from '@/lib/storage';
import { sampleMenuItems, sampleTables, sampleOrders, categories } from '@/lib/data';
import styles from '../admin.module.css';

const categoryIcons: Record<string, string> = {
    'Starters': '🥟',
    'Main Course': '🍛',
    'Drinks': '🥤',
    'Desserts': '🍮'
};

export default function MenuManagementPage() {
    const pathname = usePathname();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');

    useEffect(() => {
        initializeData(sampleMenuItems, sampleTables, sampleOrders);
        const menu = getMenu();
        setMenuItems(menu.length > 0 ? menu : sampleMenuItems);
    }, []);

    const handleToggleAvailability = (itemId: string) => {
        const item = menuItems.find(m => m.id === itemId);
        if (item) {
            updateMenuItem(itemId, { isAvailable: !item.isAvailable });
            setMenuItems(menuItems.map(m =>
                m.id === itemId ? { ...m, isAvailable: !m.isAvailable } : m
            ));
        }
    };

    const filteredItems = activeCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/orders', label: 'Orders', icon: '📋' },
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
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.headerTitle}>Menu Management</h1>
                        <p className={styles.headerSubtitle}>Enable, disable, or mark items as out of stock</p>
                    </div>
                    <button className="btn btn-primary">
                        + Add Item
                    </button>
                </div>

                {/* Category Filter */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-6)',
                    flexWrap: 'wrap'
                }}>
                    <button
                        className={`btn ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        All Items
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`btn ${activeCategory === category ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {categoryIcons[category]} {category}
                        </button>
                    ))}
                </div>

                {/* Menu List */}
                <div className={styles.menuList}>
                    {filteredItems.map(item => (
                        <div key={item.id} className={styles.menuRow}>
                            <div className={styles.menuRowImage}>
                                {categoryIcons[item.category]}
                            </div>
                            <div className={styles.menuRowInfo}>
                                <div className={styles.menuRowName}>
                                    {item.name}
                                    {item.isPopular && (
                                        <span className="badge badge-primary" style={{ marginLeft: 'var(--space-2)' }}>
                                            Popular
                                        </span>
                                    )}
                                </div>
                                <div className={styles.menuRowCategory}>{item.category}</div>
                            </div>
                            <div className={styles.menuRowPrice}>{formatPrice(item.price)}</div>
                            <div className={styles.menuRowActions}>
                                <span style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: item.isAvailable ? 'var(--success)' : 'var(--danger)',
                                    minWidth: '80px'
                                }}>
                                    {item.isAvailable ? 'Available' : 'Sold Out'}
                                </span>
                                <button
                                    className={`${styles.toggle} ${item.isAvailable ? styles.active : ''}`}
                                    onClick={() => handleToggleAvailability(item.id)}
                                    aria-label={item.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
