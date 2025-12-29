import { MenuItem, Order, Table, CartItem, OrderStatus } from './types';

const STORAGE_KEYS = {
    ORDERS: 'restaurant_orders',
    MENU: 'restaurant_menu',
    TABLES: 'restaurant_tables',
    CART: 'restaurant_cart',
};

// Helper to check if we're in browser
const isBrowser = typeof window !== 'undefined';

// Orders API Functions
export const fetchOrders = async (): Promise<Order[]> => {
    try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        return await res.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};

export const fetchOrder = async (id: string): Promise<Order | null> => {
    try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
};

export const createOrder = async (order: Order): Promise<Order | null> => {
    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
        });
        if (!res.ok) throw new Error('Failed to create order');
        return await res.json();
    } catch (error) {
        console.error('Error creating order:', error);
        return null;
    }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order | null> => {
    try {
        const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update status');
        return await res.json();
    } catch (error) {
        console.error('Error updating order status:', error);
        return null;
    }
};

// Remove legacy synchronous order functions
export const getOrders = (): Order[] => { return []; };
export const addOrder = (order: Order): void => { };
export const updateOrder = (orderId: string, status: OrderStatus): void => { };

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

// Table API Functions
export const fetchTables = async (): Promise<Table[]> => {
    try {
        const res = await fetch('/api/tables');
        if (!res.ok) throw new Error('Failed to fetch tables');
        return await res.json();
    } catch (error) {
        console.error('Error fetching tables:', error);
        return [];
    }
};

export const createTable = async (table: Table): Promise<Table | null> => {
    try {
        const res = await fetch('/api/tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(table),
        });
        if (!res.ok) throw new Error('Failed to create table');
        return await res.json();
    } catch (error) {
        console.error('Error creating table:', error);
        return null;
    }
};

export const deleteTable = async (id: number): Promise<boolean> => {
    try {
        const res = await fetch(`/api/tables/${id}`, {
            method: 'DELETE',
        });
        return res.ok;
    } catch (error) {
        console.error('Error deleting table:', error);
        return false;
    }
};

// Remove legacy synchronous table functions
export const getTables = (): Table[] => { return []; };
export const saveTables = (tables: Table[]): void => { };

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
    // Tables and Orders are now handled by API/Server
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
