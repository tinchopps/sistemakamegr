import {
    collection,
    doc,
    runTransaction,
    serverTimestamp,
    DocumentReference,
    DocumentSnapshot
} from "firebase/firestore";
import { db } from "./firebase.config";
import { SaleSchema, Sale } from "../schemas/sale.schema";
import { Product } from "../schemas/product.schema";
import { Ingredient } from "../schemas/ingredient.schema";

export const SalesService = {
    /**
     * Crea una venta y descuenta stock atómicamente.
     * Optimizado para Notebooks (Promise.all en lecturas).
     */
    createSale: async (saleData: Sale) => {
        // 1. Validación Zod Estricta
        const validation = SaleSchema.safeParse(saleData);
        if (!validation.success) {
            console.error("Error de Validación Zod:", validation.error);
            const errorMsg = validation.error.errors.map(e => e.message).join(", ");
            throw new Error(`Datos inválidos: ${errorMsg}`);
        }

        // 2. Transacción Atómica
        try {
            await runTransaction(db, async (transaction) => {
                // A. Lectura Paralela de Productos
                // Agrupamos refs para usar Promise.all
                const productRefs: DocumentReference[] = saleData.items.map(item =>
                    doc(db, "products", item.productId)
                );

                // Parallel Read: Critical for performance
                const productSnaps = await Promise.all(productRefs.map(ref => transaction.get(ref)));

                // Mapeo Rápido: ID -> Product Data
                const productMap = new Map<string, Product>();
                const ingredientDeductions = new Map<string, number>(); // ingId -> totalNeeded
                const productDeductions = new Map<string, number>(); // prodId -> quantity

                // B. Procesamiento de Lógica de Stock (En memoria)
                for (let i = 0; i < saleData.items.length; i++) {
                    const item = saleData.items[i];
                    const snap = productSnaps[i];

                    if (!snap.exists()) {
                        throw new Error(`Producto no encontrado: ${item.productName}`);
                    }

                    const product = snap.data() as Product;
                    productMap.set(item.productId, product);

                    if (product.stockType === 'direct') {
                        const currentReq = productDeductions.get(item.productId) || 0;
                        productDeductions.set(item.productId, currentReq + item.quantity);
                    } else if (product.stockType === 'recipe' && product.recipe) {
                        for (const ing of product.recipe) {
                            const currentReq = ingredientDeductions.get(ing.ingredientId) || 0;
                            const addedReq = ing.quantity * item.quantity;
                            ingredientDeductions.set(ing.ingredientId, currentReq + addedReq);
                        }
                    }
                }

                // C. Lectura Paralela de Ingredientes (Solo si necesarios)
                const ingredientIds = Array.from(ingredientDeductions.keys());
                const ingredientMap = new Map<string, { ref: DocumentReference, data: Ingredient }>();

                if (ingredientIds.length > 0) {
                    const ingredientRefs = ingredientIds.map(id => doc(db, "ingredients", id));
                    const ingredientSnaps = await Promise.all(ingredientRefs.map(ref => transaction.get(ref)));

                    for (let i = 0; i < ingredientSnaps.length; i++) {
                        const snap = ingredientSnaps[i];
                        const id = ingredientIds[i];
                        if (!snap.exists()) {
                            throw new Error(`Ingrediente ID ${id} no encontrado (definido en receta).`);
                        }
                        ingredientMap.set(id, { ref: ingredientRefs[i], data: snap.data() as Ingredient });
                    }
                }

                // D. Verificación y Escritura (Atomic Write Phase)

                // 1. Chequeo y Resta de Stock Productos Directos
                for (const [prodId, quantity] of productDeductions.entries()) {
                    const product = productMap.get(prodId)!;
                    const newStock = (product.stock || 0) - quantity;

                    if (newStock < 0) {
                        throw new Error(`STOCK_INSUFFICIENTE: ${product.name} (Disp: ${product.stock}, Req: ${quantity})`);
                    }
                    // Update in Transaction
                    transaction.update(doc(db, "products", prodId), { stock: newStock });
                }

                // 2. Chequeo y Resta de Stock Ingredientes
                for (const [ingId, quantity] of ingredientDeductions.entries()) {
                    const { ref, data } = ingredientMap.get(ingId)!;
                    const newStock = data.currentStock - quantity;

                    if (newStock < 0) {
                        // Convert units for friendly error if needed, but keeping simple for now
                        throw new Error(`STOCK_INSUFFICIENTE: Ingrediente ${data.name} (Disp: ${data.currentStock}, Req: ${quantity})`);
                    }
                    transaction.update(ref, { currentStock: newStock });
                }

                // 3. Crear Venta (Immutable Snapshot)
                const newSaleRef = doc(collection(db, "sales"));
                // Ensure we save exact snapshot data
                const finalSaleData = {
                    ...saleData,
                    id: newSaleRef.id,
                    createdAt: serverTimestamp(),
                    items: saleData.items.map(item => {
                        // Retrieve original product to ensure category/name consistency if desired,
                        // strictly using what was passed in saleData but validated against DB exists.
                        // Enriched data could be added here.
                        return { ...item };
                    })
                };

                transaction.set(newSaleRef, finalSaleData);
            });

            return { success: true };

        } catch (error: any) {
            console.error("Transaction Error:", error);
            // Friendly message extraction
            const message = error.message.includes("STOCK_INSUFFICIENTE")
                ? error.message
                : "Error al procesar la venta. Intente nuevamente.";
            throw new Error(message);
        }
    }
};
