'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CartItem, MenuItem, Extra, Size } from '@/lib/types';
import { getCart, saveCart, clearCart as clearCartStorage, generateId, calculateOrderTotals } from '@/lib/storage';

interface CartContextType {
    items: CartItem[];
    addItem: (menuItem: MenuItem, quantity?: number, size?: Size, extras?: Extra[], instructions?: string) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getItemCount: () => number;
    getTotals: () => { subtotal: number; tax: number; total: number };
    tableNumber: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children, tableNumber }: { children: ReactNode; tableNumber: number }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = getCart(tableNumber);
        setItems(savedCart);
    }, [tableNumber]);

    useEffect(() => {
        saveCart(tableNumber, items);
    }, [items, tableNumber]);

    const addItem = (
        menuItem: MenuItem,
        quantity = 1,
        selectedSize?: Size,
        selectedExtras: Extra[] = [],
        specialInstructions?: string
    ) => {
        // Check if same item with same options already exists
        const existingIndex = items.findIndex(
            item =>
                item.menuItem.id === menuItem.id &&
                item.selectedSize?.id === selectedSize?.id &&
                JSON.stringify(item.selectedExtras.map(e => e.id).sort()) ===
                JSON.stringify(selectedExtras.map(e => e.id).sort())
        );

        if (existingIndex !== -1) {
            // Update quantity
            const updated = [...items];
            updated[existingIndex].quantity += quantity;
            setItems(updated);
        } else {
            // Add new item
            const newItem: CartItem = {
                id: generateId(),
                menuItem,
                quantity,
                selectedSize,
                selectedExtras,
                specialInstructions
            };
            setItems([...items, newItem]);
        }
    };

    const removeItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }
        setItems(items.map(item => (item.id === itemId ? { ...item, quantity } : item)));
    };

    const clearCartItems = () => {
        setItems([]);
        clearCartStorage(tableNumber);
    };

    const getItemCount = () => items.reduce((sum, item) => sum + item.quantity, 0);

    const getTotals = () => calculateOrderTotals(items);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart: clearCartItems,
                getItemCount,
                getTotals,
                tableNumber
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
