import { z } from 'zod';

// Item Snapshot: Lo que se guarda en la venta (Inmutable)
export const SaleItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    category: z.string(), // Para reportes
    unitPrice: z.number().int().positive(), // Precio al momento de la venta
    costAtSale: z.number().int().nonnegative().optional(), // Costo histórico (opcional)
    quantity: z.number().int().positive(),
    subtotal: z.number().int().positive() // Debe coincidir con unitPrice * quantity
}).refine((data) => data.subtotal === data.unitPrice * data.quantity, {
    message: "El subtotal del ítem no coincide con precio * cantidad",
    path: ['subtotal']
});

export const SaleSchema = z.object({
    userId: z.string().min(1, "El usuario (cajero) es obligatorio"),
    items: z.array(SaleItemSchema).min(1, "El carrito no puede estar vacío"),

    // Totales
    subtotal: z.number().int().positive(),
    discountAmount: z.number().int().nonnegative().default(0),
    deliveryFee: z.number().int().nonnegative().default(0),
    totalAmount: z.number().int().positive(),

    // Pagos
    paymentMethods: z.array(z.object({
        method: z.enum(['cash', 'transfer']),
        amount: z.number().int().positive()
    })).min(1, "Debe haber al menos un método de pago"),

    // Estado y Metadata
    status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).default('pending'),
    customerId: z.string().optional(), // Para delivery
    shiftId: z.string().min(1, "El ID de turno de caja es obligatorio"),
    createdAt: z.date().optional() // Firestore Timestamp
}).superRefine((data, ctx) => {
    // 1. Validar Sumatoria de Items vs Subtotal Global
    const itemsSum = data.items.reduce((acc, item) => acc + item.subtotal, 0);
    if (itemsSum !== data.subtotal) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El subtotal global (${data.subtotal}) no coincide con la suma de ítems (${itemsSum})`,
            path: ['subtotal']
        });
    }

    // 2. Validar Cálculo Financiero (Subtotal - Descuento + Delivery = Total)
    const calculatedTotal = data.subtotal - data.discountAmount + data.deliveryFee;
    if (data.totalAmount !== calculatedTotal) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Error matemático: Total declarado (${data.totalAmount}) != Calculado (${calculatedTotal})`,
            path: ['totalAmount']
        });
    }

    // 3. Validar Pagos vs Total
    const paymentsSum = data.paymentMethods.reduce((acc, pm) => acc + pm.amount, 0);
    if (paymentsSum !== data.totalAmount) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Los pagos suman ${paymentsSum}, pero el total es ${data.totalAmount}`,
            path: ['paymentMethods']
        });
    }
});

export type Sale = z.infer<typeof SaleSchema>;
export type SaleItem = z.infer<typeof SaleItemSchema>;
