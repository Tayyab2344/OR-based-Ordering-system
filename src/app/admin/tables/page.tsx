'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Table } from '@/lib/types';
import { fetchTables, createTable, initializeData } from '@/lib/storage';
import { sampleMenuItems, sampleTables, sampleOrders } from '@/lib/data';
import styles from '../admin.module.css';

export default function TablesPage() {
    const pathname = usePathname();
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        initializeData(sampleMenuItems, [], []); // No internal legacy init for tables/orders

        const loadTables = async () => {
            const allTables = await fetchTables();
            setTables(allTables.length > 0 ? allTables : []);
        };

        loadTables();
    }, []);

    const getQRUrl = (tableId: number) => {
        // In production, this would be the actual domain
        return `${typeof window !== 'undefined' ? window.location.origin : ''}/customer/${tableId}`;
    };

    const handleDownloadQR = (tableId: number) => {
        const svg = document.getElementById(`qr-${tableId}`);
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = 400;
                canvas.height = 400;
                if (ctx) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, 400, 400);

                    const pngFile = canvas.toDataURL('image/png');
                    const downloadLink = document.createElement('a');
                    downloadLink.download = `table-${tableId}-qr.png`;
                    downloadLink.href = pngFile;
                    downloadLink.click();
                }
            };

            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
    };

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/orders', label: 'Orders', icon: '📋' },
        { href: '/admin/tables', label: 'Tables', icon: '🍽️' },
        { href: '/admin/menu', label: 'Menu', icon: '📖' },
        { href: '/admin/analytics', label: 'Analytics', icon: '📈' }
    ];

    const handleAddTable = async () => {
        const newId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
        const newTable: Table = {
            id: newId,
            name: `Table ${newId}`,
            seats: 4,
            isOccupied: false
        };

        const created = await createTable(newTable);
        if (created) {
            setTables([...tables, created]);
        }
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
                        <h1 className={styles.headerTitle}>Tables</h1>
                        <p className={styles.headerSubtitle}>Manage tables and generate QR codes</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleAddTable}
                    >
                        + Add Table
                    </button>
                </div>

                {/* Tables Grid */}
                <div className={styles.tablesGrid}>
                    {tables.map(table => (
                        <div
                            key={table.id}
                            className={`${styles.tableCard} ${table.isOccupied ? styles.occupied : ''}`}
                        >
                            <div className={styles.tableCardNumber}>{table.id}</div>
                            <div className={styles.tableCardSeats}>{table.seats} seats</div>
                            <span className={`${styles.tableCardStatus} ${table.isOccupied ? styles.occupied : styles.available}`}>
                                {table.isOccupied ? 'Occupied' : 'Available'}
                            </span>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    setSelectedTable(table);
                                    setShowQRModal(true);
                                }}
                                style={{ width: '100%' }}
                            >
                                View QR Code
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* QR Modal */}
            {showQRModal && selectedTable && (
                <div className="modal-backdrop" onClick={() => setShowQRModal(false)}>
                    <div className="modal animate-slideUp" onClick={e => e.stopPropagation()}>
                        <h2 style={{
                            textAlign: 'center',
                            marginBottom: 'var(--space-6)',
                            fontSize: 'var(--font-size-xl)'
                        }}>
                            Table {selectedTable.id} QR Code
                        </h2>

                        <div style={{
                            background: 'white',
                            padding: 'var(--space-6)',
                            borderRadius: 'var(--radius-xl)',
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: 'var(--space-6)'
                        }}>
                            <QRCodeSVG
                                id={`qr-${selectedTable.id}`}
                                value={getQRUrl(selectedTable.id)}
                                size={250}
                                level="H"
                                includeMargin
                                fgColor="#0a0a0a"
                                bgColor="#ffffff"
                            />
                        </div>

                        <p style={{
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontSize: 'var(--font-size-sm)',
                            marginBottom: 'var(--space-4)'
                        }}>
                            Scan this code to order from Table {selectedTable.id}
                        </p>

                        <div style={{
                            background: 'var(--bg-tertiary)',
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-lg)',
                            textAlign: 'center',
                            marginBottom: 'var(--space-6)',
                            wordBreak: 'break-all',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--text-secondary)'
                        }}>
                            {getQRUrl(selectedTable.id)}
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowQRModal(false)}
                                style={{ flex: 1 }}
                            >
                                Close
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleDownloadQR(selectedTable.id)}
                                style={{ flex: 1 }}
                            >
                                Download PNG
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
