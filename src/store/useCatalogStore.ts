import { create } from 'zustand';
import { db } from '../services/firebase.config';
import { collection, onSnapshot, addDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ProductSchema, type Product } from '../schemas/product.schema';
import { IngredientSchema, type Ingredient } from '../schemas/ingredient.schema';

interface CatalogState {
    products: Product[];
    ingredients: Ingredient[];
    isLoading: boolean;
    error: string | null;

    // Subscriptions
    subscribeToCatalog: () => () => void; // Returns unsubscribe function

    // Actions (Async wrapper for cleaner UI components)
    createProduct: (product: Product) => Promise<void>;
    createIngredient: (ingredient: Ingredient) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    deleteIngredient: (id: string) => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set) => ({
    products: [],
    ingredients: [],
    isLoading: true,
    error: null,

    subscribeToCatalog: () => {
        set({ isLoading: true });

        // Subscribe to Products
        const qProd = query(collection(db, "products"), orderBy("name"));
        const unsubProd = onSnapshot(qProd,
            (snapshot) => {
                const prodData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                set({ products: prodData });
            },
            (error) => {
                console.error("Error fetching products:", error);
                set({ error: "Error cargando productos" });
            }
        );

        // Subscribe to Ingredients
        const qIng = query(collection(db, "ingredients"), orderBy("name"));
        const unsubIng = onSnapshot(qIng,
            (snapshot) => {
                const ingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
                set({
                    ingredients: ingData,
                    isLoading: false // Done when both load (simplification: technically race here but good enough for MVP)
                });
            },
            (error) => {
                console.error("Error fetching ingredients:", error);
                set({ error: "Error cargando ingredientes", isLoading: false });
            }
        );

        return () => {
            unsubProd();
            unsubIng();
        };
    },

    createProduct: async (product) => {
        // Validate again just in case
        const parsed = ProductSchema.parse(product);
        // Remove id if present to let auto-id work or handle logic
        const { id, ...data } = parsed;
        await addDoc(collection(db, "products"), data);
    },

    createIngredient: async (ingredient) => {
        const parsed = IngredientSchema.parse(ingredient);
        const { id, ...data } = parsed;
        await addDoc(collection(db, "ingredients"), data);
    },

    deleteProduct: async (id) => {
        await deleteDoc(doc(db, "products", id));
    },

    deleteIngredient: async (id) => {
        await deleteDoc(doc(db, "ingredients", id));
    }
}));
