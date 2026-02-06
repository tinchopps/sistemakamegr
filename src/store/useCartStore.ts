import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '../schemas/product.schema';
import type { SaleItem } from '../schemas/sale.schema';

interface CartState {
    items: SaleItem[];
    discountAmount: number; // in cents
    deliveryFee: number; // in cents

    // Actions
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    setDiscount: (amount: number) => void;
    setDeliveryFee: (amount: number) => void;
    clearCart: () => void;

    // Computed (Getters typically handled in component or via selector, 
    // but we can store totals if we want strict consistency)
    getSubtotal: () => number;
    getTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            discountAmount: 0,
            deliveryFee: 0,

            addItem: (product, quantity = 1) => {
                const { items } = get();
                const existingItem = items.find((i) => i.productId === product.id);

                if (existingItem) {
                    // Update existing
                    const newQuantity = existingItem.quantity + quantity;
                    const updatedItems = items.map((i) =>
                        i.productId === product.id
                            ? { ...i, quantity: newQuantity, subtotal: i.unitPrice * newQuantity }
                            : i
                    );
                    set({ items: updatedItems });
                } else {
                    // Add new
                    if (!product.id) {
                        console.error("Attempted to add product without ID");
                        return;
                    }
                    const newItem: SaleItem = {
                        productId: product.id,
                        productName: product.name,
                        category: product.category,
                        unitPrice: product.price, // Price in cents
                        quantity: quantity,
                        subtotal: product.price * quantity,
                        // costAtSale: product.cost // If we had cost in product
                    };
                    set({ items: [...items, newItem] });
                }
            },

            removeItem: (productId) => {
                set({ items: get().items.filter((i) => i.productId !== productId) });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.productId === productId
                            ? { ...i, quantity, subtotal: i.unitPrice * quantity }
                            : i
                    ),
                });
            },

            setDiscount: (amount) => set({ discountAmount: amount }),
            setDeliveryFee: (amount) => set({ deliveryFee: amount }),

            clearCart: () => set({ items: [], discountAmount: 0, deliveryFee: 0 }),

            getSubtotal: () => {
                return get().items.reduce((acc, item) => acc + item.subtotal, 0);
            },

            getTotal: () => {
                const sub = get().getSubtotal();
                const { discountAmount, deliveryFee } = get();
                return Math.max(0, sub - discountAmount + deliveryFee);
            }
        }),
        {
            name: 'kame-pos-cart', // key in localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);
