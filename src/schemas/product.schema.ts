import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  price: z.number().int().positive("El precio debe ser un entero positivo (centavos)"),
  category: z.string().min(1, "La categoría es obligatoria"),
  isActive: z.boolean().default(true),
  // Stock Híbrido: Directo o Receta
  stockType: z.enum(['direct', 'recipe']),
  // Stock Directo: integer >= 0
  stock: z.number().int().nonnegative().optional(),
  // Receta: Array de ingredientes
  recipe: z.array(z.object({
    ingredientId: z.string(),
    quantity: z.number().int().positive("La cantidad debe ser mayor a 0 (unidad mínima)")
  })).optional()
}).refine(data => {
  if (data.stockType === 'direct') {
    return data.stock !== undefined && data.stock !== null;
  }
  if (data.stockType === 'recipe') {
    return data.recipe !== undefined && data.recipe.length > 0;
  }
  return false;
}, {
  message: "Debe definir 'stock' para tipo directo o 'recipe' para tipo receta",
  path: ['stockType'] // Error pointer
});

export type Product = z.infer<typeof ProductSchema>;
