// Export schemas and types
export * from '../schemas/product.schema';
export * from '../schemas/ingredient.schema';
export * from '../schemas/sale.schema';

// Additional Shared Interface
export interface CartItem {
    product: import('../schemas/product.schema').Product;
    quantity: number;
    subtotal: number; // Helper for display (cents)
}
