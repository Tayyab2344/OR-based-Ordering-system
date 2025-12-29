import { Order, CartItem, MenuItem, Table } from './types';

const STORAGE_KEYS = {
    ORDERS: 'restaurant_orders',
    MENU: 'restaurant_menu',
    TABLES: 'restaurant_tables',
    CART: 'restaurant_cart',
};

// Helper to check if we're in browser
const isBrowser = typeof window !== 'undefined';

// Orders
export function getOrders(): Order[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
}

export function saveOrders(orders: Order[]): void {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    // Dispatch event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.ORDERS,
        newValue: JSON.stringify(orders)
    }));
}

export function addOrder(order: Order): void {
    const orders = getOrders();
    orders.push(order);
    saveOrders(orders);
}

export function updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders[index].status = status;
        orders[index].updatedAt = new Date().toISOString();
        saveOrders(orders);
    }
}

export function getOrderById(orderId: string): Order | undefined {
    const orders = getOrders();
    return orders.find(o => o.id === orderId);
}

// Menu
export function getMenu(): MenuItem[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem(STORAGE_KEYS.MENU);
    return data ? JSON.parse(data) : [];
}

export function saveMenu(menu: MenuItem[]): void {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
}

export function updateMenuItem(itemId: string, updates: Partial<MenuItem>): void {
    const menu = getMenu();
    const index = menu.findIndex(m => m.id === itemId);
    if (index !== -1) {
        menu[index] = { ...menu[index], ...updates };
        saveMenu(menu);
    }
}

// Tables
export function getTables(): Table[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem(STORAGE_KEYS.TABLES);
    return data ? JSON.parse(data) : [];
}

export function saveTables(tables: Table[]): void {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
}

// Cart (per table)
export function getCart(tableNumber: number): CartItem[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem(`${STORAGE_KEYS.CART}_${tableNumber}`);
    return data ? JSON.parse(data) : [];
}

export function saveCart(tableNumber: number, cart: CartItem[]): void {
    if (!isBrowser) return;
    localStorage.setItem(`${STORAGE_KEYS.CART}_${tableNumber}`, JSON.stringify(cart));
}

export function clearCart(tableNumber: number): void {
    if (!isBrowser) return;
    localStorage.removeItem(`${STORAGE_KEYS.CART}_${tableNumber}`);
}

// Initialize with sample data
export function initializeData(menuItems: MenuItem[], tables: Table[], orders: Order[]): void {
    if (!isBrowser) return;

    // Only initialize if not already set
    // Always update menu to reflect code changes (prices, images, etc.)
    saveMenu(menuItems);
    if (!localStorage.getItem(STORAGE_KEYS.TABLES)) {
        saveTables(tables);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        saveOrders(orders);
    }
}

// Generate unique ID
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format price in PKR
export function formatPrice(price: number): string {
    return `Rs. ${price.toLocaleString()}`;
}

// Calculate order totals
export function calculateOrderTotals(items: CartItem[]): { subtotal: number; tax: number; total: number } {
    const subtotal = items.reduce((sum, item) => {
        let itemPrice = item.menuItem.price;
        if (item.selectedSize) {
            itemPrice += item.selectedSize.priceModifier;
        }
        const extrasPrice = item.selectedExtras.reduce((e, extra) => e + extra.price, 0);
        return sum + (itemPrice + extrasPrice) * item.quantity;
    }, 0);

    const tax = Math.round(subtotal * 0.16); // 16% GST
    const total = subtotal + tax;

    return { subtotal, tax, total };
}

// Cross-tab sync listener
export function onStorageChange(callback: (key: string) => void): () => void {
    if (!isBrowser) return () => { };

    const handler = (e: StorageEvent) => {
        if (e.key && Object.values(STORAGE_KEYS).some(k => e.key?.startsWith(k))) {
            callback(e.key);
        }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
}
