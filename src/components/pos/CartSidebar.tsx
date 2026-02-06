import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { SalesService } from '../../services/sales.service';
import { Trash2, Minus, Plus, Loader2 } from 'lucide-react';
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
        <div className="flex flex-col h-full bg-[#F9FAFB] text-black shadow-2xl relative font-mono z-30 border-l border-gray-200">
            {/* Shadow overlay to separate from dark content */}
            <div className="absolute inset-y-0 -left-4 w-4 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />

            <Toaster />

            {/* Header Ticket Style - Thermal */}
            <div className="p-6 border-b-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center bg-[#F9FAFB]">
                <h2 className="text-3xl font-black uppercase tracking-widest text-[#121212]">
                    KAME POS
                </h2>
                <div className="text-xs font-bold text-gray-500 mt-2 font-mono">
                    TICKET #{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-mono">
                    {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Items List - Thermal */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#F9FAFB]">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-40 font-sans">
                        <ShoppingBagIcon className="w-16 h-16 mb-4 stroke-1" />
                        <p className="font-medium text-sm uppercase tracking-wide">Ticket Vacío</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {items.map((item) => (
                            <motion.div
                                key={item.productId}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                layout
                                className="flex justify-between items-start text-sm border-b border-gray-200 pb-3 pt-1 group"
                            >
                                {/* Quantity & Name */}
                                <div className="flex gap-3 items-start">
                                    <div className="flex flex-col items-center gap-1 bg-gray-100 rounded-md p-1 border border-gray-200 shadow-sm">
                                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="text-gray-500 hover:text-kame-orange transition-colors"><Plus size={12} /></button>
                                        <span className="font-bold w-5 text-center text-black font-mono text-base">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="text-gray-500 hover:text-red-500 transition-colors"><Minus size={12} /></button>
                                    </div>
                                    <div className="flex flex-col pt-1">
                                        <span className="font-bold uppercase text-black leading-tight text-sm">{item.productName}</span>
                                        <span className="text-xs text-gray-500 font-mono mt-0.5">
                                            {formatPrice(item.unitPrice)}
                                        </span>
                                    </div>
                                </div>

                                {/* Price & Remove */}
                                <div className="flex items-center gap-3 pt-1">
                                    <span className="font-bold font-mono text-base text-black tracking-tight">
                                        {formatPrice(item.subtotal)}
                                    </span>
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer / Totals - Thermal */}
            <div className="mt-auto bg-[#F9FAFB] p-6 border-t-2 border-dashed border-gray-300 relative z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                {/* Sawtooth / Ripped paper decorative top border could go here */}

                <div className="space-y-2 mb-6 text-sm font-mono text-gray-600">
                    <div className="flex justify-between">
                        <span>SUBTOTAL</span>
                        <span className="font-bold">{formatPrice(subtotal)}</span>
                    </div>
                    {deliveryFee > 0 && (
                        <div className="flex justify-between">
                            <span>ENVÍO</span>
                            <span className="font-bold">{formatPrice(deliveryFee)}</span>
                        </div>
                    )}
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>DESCUENTO</span>
                            <span className="font-bold">-{formatPrice(discountAmount)}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-4xl font-black text-black pt-4 border-t-2 border-black mt-4 items-end">
                        <span className="text-base font-bold mb-1">TOTAL</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={items.length === 0 || isProcessing}
                    className={cn(
                        "w-full h-16 rounded-xl font-black text-xl tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-500/20",
                        "bg-[#E67E22] text-white hover:bg-orange-600 border border-orange-600"
                    )}
                >
                    {isProcessing ? (
                        <><Loader2 className="w-6 h-6 animate-spin" /> PROCESANDO</>
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


