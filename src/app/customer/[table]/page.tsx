'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CartProvider, useCart } from '@/context/CartContext';
import { MenuItem, Extra, Size } from '@/lib/types';
import { sampleMenuItems, categories } from '@/lib/data';
import { getMenu, saveMenu, formatPrice, initializeData } from '@/lib/storage';
import { sampleMenuItems as initialMenu, sampleTables, sampleOrders } from '@/lib/data';
import styles from './menu.module.css';

// Icons as simple components
const ZapIcon = () => <span>⚡</span>;
const SearchIcon = () => <span>🔍</span>;
const TableIcon = () => <span>🍽️</span>;
const StartersIcon = () => <span>🥟</span>;
const MainCourseIcon = () => <span>🍛</span>;
const DrinksIcon = () => <span>🥤</span>;
const DessertsIcon = () => <span>🍮</span>;
const AlertIcon = () => <span>⚠️</span>;
const PlusIcon = () => <span>+</span>;
const MinusIcon = () => <span>−</span>;
const TrashIcon = () => <span>🗑️</span>;
const CartIcon = () => <span>🛒</span>;
const ArrowRightIcon = () => <span>→</span>;

const categoryIcons: Record<string, React.ReactNode> = {
    'Starters': <StartersIcon />,
    'Main Course': <MainCourseIcon />,
    'Drinks': <DrinksIcon />,
    'Desserts': <DessertsIcon />
};

function MenuContent() {
    const params = useParams();
    const router = useRouter();
    const tableNumber = parseInt(params.table as string) || 1;
    const { items: cartItems, addItem, removeItem, updateQuantity, getTotals, getItemCount } = useCart();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>(categories[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    useEffect(() => {
        // Initialize data
        initializeData(initialMenu, sampleTables, sampleOrders);
        const menu = getMenu();
        setMenuItems(menu.length > 0 ? menu : sampleMenuItems);
    }, []);

    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesCategory = item.category === activeCategory;
            const matchesSearch = searchQuery === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [menuItems, activeCategory, searchQuery]);

    const handleAddToCart = (item: MenuItem) => {
        if (!item.isAvailable) return;

        if (item.sizes || (item.extras && item.extras.length > 0)) {
            setSelectedItem(item);
            setShowModal(true);
        } else {
            addItem(item);
        }
    };

    const handleCheckout = () => {
        router.push(`/customer/${tableNumber}/checkout`);
    };

    const totals = getTotals();
    const itemCount = getItemCount();

    return (
        <div className={styles.menuPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}><ZapIcon /></div>
                    <span>Neon Bites</span>
                </div>

                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}><SearchIcon /></span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search for dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.headerRight}>
                    <div className={styles.tableIndicator}>
                        <TableIcon />
                        <span>Table #{tableNumber}</span>
                    </div>
                    <div className={styles.avatar}>G</div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <h3 className={styles.sidebarTitle}>Menu</h3>
                <p className={styles.sidebarSubtitle}>Quick Jump</p>

                <nav className={styles.categoryList}>
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`${styles.categoryItem} ${activeCategory === category ? styles.active : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            <span className={styles.categoryIcon}>{categoryIcons[category]}</span>
                            <span>{category}</span>
                        </button>
                    ))}
                </nav>

                <div className={styles.allergyNotice}>
                    <h4><AlertIcon /> Allergies?</h4>
                    <p>Please inform our staff if you have any food allergies.</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Hero Banner */}
                <div className={styles.heroBanner}>
                    <div className={styles.heroBannerContent}>
                        <span className={styles.heroBannerLabel}>Seasonal Special</span>
                        <h1 className={styles.heroBannerTitle}>Welcome to Neon Bites</h1>
                        <p className={styles.heroBannerText}>
                            Experience the fusion of future tech and ancient flavors. Order directly from your table.
                        </p>
                    </div>
                </div>

                {/* Menu Sections */}
                {categories.map(category => (
                    <section
                        key={category}
                        className={styles.menuSection}
                        style={{ display: activeCategory === category || searchQuery ? 'block' : 'none' }}
                    >
                        <h2 className={styles.sectionTitle}>{category}</h2>
                        <div className={styles.menuGrid}>
                            {filteredItems
                                .filter(item => item.category === category)
                                .map(item => (
                                    <div key={item.id} className={styles.menuCard}>
                                        <div className={styles.menuCardImage}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            {item.isPopular && (
                                                <span className={styles.popularBadge}>Popular</span>
                                            )}
                                            {!item.isAvailable && (
                                                <div className={styles.soldOutOverlay}>
                                                    <span className={styles.soldOutBadge}>SOLD OUT</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.menuCardBody}>
                                            <div className={styles.menuCardHeader}>
                                                <h3 className={styles.menuCardName}>{item.name}</h3>
                                                <span className={styles.menuCardPrice}>{formatPrice(item.price)}</span>
                                            </div>
                                            <p className={styles.menuCardDesc}>{item.description}</p>
                                            <div className={styles.menuCardActions}>
                                                <button
                                                    className={styles.addButton}
                                                    onClick={() => handleAddToCart(item)}
                                                    disabled={!item.isAvailable}
                                                >
                                                    <PlusIcon /> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* Cart Panel */}
            <aside className={styles.cartPanel}>
                <div className={styles.cartHeader}>
                    <h3 className={styles.cartTitle}>Your Order</h3>
                    {itemCount > 0 && (
                        <span className={styles.itemCount}>{itemCount} items</span>
                    )}
                </div>

                <div className={styles.cartItems}>
                    {cartItems.length === 0 ? (
                        <div className={styles.cartEmpty}>
                            <div className={styles.cartEmptyIcon}><CartIcon /></div>
                            <p>Your cart is empty</p>
                            <p>Add items from the menu to get started</p>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className={styles.cartItem}>
                                <img
                                    src={item.menuItem.image}
                                    alt={item.menuItem.name}
                                    className={styles.cartItemImage}
                                    style={{
                                        objectFit: 'cover'
                                    }}
                                />
                                <div className={styles.cartItemInfo}>
                                    <div className={styles.cartItemName}>{item.menuItem.name}</div>
                                    {(item.selectedExtras.length > 0 || item.selectedSize) && (
                                        <div className={styles.cartItemExtras}>
                                            {item.selectedSize && item.selectedSize.name}
                                            {item.selectedExtras.map(e => e.name).join(', ')}
                                        </div>
                                    )}
                                    <div className={styles.cartItemControls}>
                                        <div className={styles.quantityControl}>
                                            <button
                                                className={styles.quantityBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <MinusIcon />
                                            </button>
                                            <span className={styles.quantity}>{item.quantity}</span>
                                            <button
                                                className={styles.quantityBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <PlusIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.cartItemPrice}>
                                    <div className={styles.cartItemPriceValue}>
                                        {formatPrice(
                                            (item.menuItem.price +
                                                (item.selectedSize?.priceModifier || 0) +
                                                item.selectedExtras.reduce((s, e) => s + e.price, 0)
                                            ) * item.quantity
                                        )}
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className={styles.cartFooter}>
                        <div className={styles.cartTotals}>
                            <div className={styles.cartTotalRow}>
                                <span>Subtotal</span>
                                <span>{formatPrice(totals.subtotal)}</span>
                            </div>
                            <div className={styles.cartTotalRow}>
                                <span>Tax (16%)</span>
                                <span>{formatPrice(totals.tax)}</span>
                            </div>
                            <div className={`${styles.cartTotalRow} ${styles.total}`}>
                                <span>Total</span>
                                <span className={styles.value}>{formatPrice(totals.total)}</span>
                            </div>
                        </div>
                        <button
                            className={styles.checkoutButton}
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout <ArrowRightIcon />
                        </button>
                    </div>
                )}
            </aside>

            {/* Customization Modal */}
            {showModal && selectedItem && (
                <ItemCustomizationModal
                    item={selectedItem}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedItem(null);
                    }}
                    onAdd={(size, extras, instructions) => {
                        addItem(selectedItem, 1, size, extras, instructions);
                        setShowModal(false);
                        setSelectedItem(null);
                    }}
                />
            )}
        </div>
    );
}

// Item Customization Modal Component
function ItemCustomizationModal({
    item,
    onClose,
    onAdd
}: {
    item: MenuItem;
    onClose: () => void;
    onAdd: (size?: Size, extras?: Extra[], instructions?: string) => void;
}) {
    const [selectedSize, setSelectedSize] = useState<Size | undefined>(
        item.sizes?.[0]
    );
    const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
    const [instructions, setInstructions] = useState('');

    const toggleExtra = (extra: Extra) => {
        if (selectedExtras.find(e => e.id === extra.id)) {
            setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
        } else {
            setSelectedExtras([...selectedExtras, extra]);
        }
    };

    const totalPrice =
        item.price +
        (selectedSize?.priceModifier || 0) +
        selectedExtras.reduce((sum, e) => sum + e.price, 0);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal animate-slideUp" onClick={e => e.stopPropagation()}>
                <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xl)' }}>
                    Customize {item.name}
                </h2>

                {/* Size Selection */}
                {item.sizes && item.sizes.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h4 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                            Size
                        </h4>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            {item.sizes.map(size => (
                                <button
                                    key={size.id}
                                    className={`btn ${selectedSize?.id === size.id ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size.name}
                                    {size.priceModifier > 0 && ` (+${formatPrice(size.priceModifier)})`}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Extras Selection */}
                {item.extras && item.extras.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h4 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                            Extras
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {item.extras.map(extra => (
                                <label
                                    key={extra.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-3)',
                                        background: selectedExtras.find(e => e.id === extra.id)
                                            ? 'var(--accent-primary-light)'
                                            : 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        cursor: 'pointer',
                                        border: selectedExtras.find(e => e.id === extra.id)
                                            ? '1px solid var(--accent-primary)'
                                            : '1px solid transparent'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!selectedExtras.find(e => e.id === extra.id)}
                                        onChange={() => toggleExtra(extra)}
                                        style={{ accentColor: 'var(--accent-primary)' }}
                                    />
                                    <span style={{ flex: 1 }}>{extra.name}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {extra.price > 0 ? `+${formatPrice(extra.price)}` : 'Free'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Special Instructions */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h4 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                        Special Instructions (Optional)
                    </h4>
                    <textarea
                        className="input"
                        placeholder="e.g., No onions, extra spicy..."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={3}
                        style={{ resize: 'none' }}
                    />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => onAdd(selectedSize, selectedExtras, instructions)}
                        style={{ flex: 2 }}
                    >
                        Add to Order - {formatPrice(totalPrice)}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Page Component with Provider
export default function MenuPage() {
    const params = useParams();
    const tableNumber = parseInt(params.table as string) || 1;

    return (
        <CartProvider tableNumber={tableNumber}>
            <MenuContent />
        </CartProvider>
    );
}
