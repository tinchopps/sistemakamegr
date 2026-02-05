import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { SalesService } from '../../services/sales.service';
import { Trash2, Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { cn } from '../ui/Card';

export default function CartSidebar() {
    const { items, removeItem, updateQuantity, getTotal, clearCart, getSubtotal, discountAmount, deliveryFee } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);

    const total = getTotal();
    const subtotal = getSubtotal();

    const handleCheckout = async () => {
        if (items.length === 0) return;

        setIsProcessing(true);
        try {
            // Build Sale Object
            // TODO: Get real user ID from Auth context layer (Mocked for now)
            const saleData = {
                userId: "mock-user-id",
                items: items, // Already validated schema shape in store/add
                subtotal: subtotal,
                discountAmount: discountAmount,
                deliveryFee: deliveryFee,
                totalAmount: total,
                paymentMethods: [{ method: 'cash' as const, amount: total }], // Simple cash flow for MVP Phase C
                status: 'pending' as const,
                shiftId: 'mock-shift-id' // Mocked open shift
            };

            await SalesService.createSale(saleData as any); // Type assertion until full Auth/Shift integration

            toast.success("¡Venta registrada con éxito!", {
                duration: 2000,
                position: 'top-center',
                style: { background: '#27AE60', color: 'white', border: 'none' }
            });

            clearCart();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al procesar la venta", {
                style: { background: '#E74C3C', color: 'white', border: 'none' }
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cents / 100);
    };

    return (
        <div className="flex flex-col h-full bg-kame-surface text-white shadow-2xl relative">
            <Toaster />

            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-kame-orange" />
                    Comanda Actual
                </h2>
                <span className="text-sm text-gray-400 font-medium bg-white/5 px-2 py-1 rounded-md">
                    #{items.length} ítems
                </span>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                        <ShoppingBagIcon className="w-16 h-16 mb-4 stroke-1" />
                        <p>El carrito está vacío</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {items.map((item) => (
                            <motion.div
                                key={item.productId}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                layout
                                className="bg-kame-gray p-3 rounded-xl border border-white/5 flex gap-3 group"
                            >
                                {/* Quantity Controls */}
                                <div className="flex flex-col items-center justify-between bg-black/20 rounded-lg p-1 w-8 shrink-0">
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        className="hover:text-kame-orange transition-colors p-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        className="hover:text-red-400 transition-colors p-1"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm truncate">{item.productName}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-gray-400">
                                            {formatPrice(item.unitPrice)} x {item.quantity}
                                        </span>
                                        <span className="text-sm font-bold text-kame-orange">
                                            {formatPrice(item.subtotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={() => removeItem(item.productId)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all self-center"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer / Totals */}
            <div className="mt-auto bg-black p-6 border-t border-white/10">
                <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between text-gray-400">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    {/* Placeholder for discounts if implemented in Phase C+ */}
                    {discountAmount > 0 && <div className="flex justify-between text-green-400"><span>Descuento</span><span>-{formatPrice(discountAmount)}</span></div>}

                    <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10 mt-2">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={items.length === 0 || isProcessing}
                    className={cn(
                        "w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        "bg-kame-orange text-black hover:bg-orange-400 hover:shadow-lg hover:shadow-orange-500/20"
                    )}
                >
                    {isProcessing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                    ) : (
                        "COBRAR (F1)"
                    )}
                </button>
            </div>
        </div>
    );
}

function ShoppingBagIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
