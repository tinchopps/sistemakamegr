import { z } from 'zod';

export const IngredientSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "El nombre es obligatorio"),
    unit: z.enum(['g', 'ml', 'u']),
    // Stock en Unidad Mínima (ej: gramos). Entero.
    currentStock: z.number().int().nonnegative("El stock debe ser un entero no negativo"),
    minStock: z.number().int().nonnegative(),
    // Costo por unidad de medida en centavos (ej: precio de 1 gramo) o costo de compra?
    // Usualmente se guarda el costo promedio ponderado.
    costPerUnit: z.number().int().nonnegative("El costo debe ser un entero no negativo (centavos)")
});

export type Ingredient = z.infer<typeof IngredientSchema>;
