import { useCartStore } from '../../store/useCartStore';
import { Product } from '../../schemas/product.schema';
import { Card } from '../ui/Card';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data for Phase C MVP (Will be replaced by Firestore Hook later)
const MOCK_PRODUCTS: Product[] = [
    { id: '1', name: 'Pizza Muzza', price: 1200000, category: 'Pizzas', stockType: 'recipe', isActive: true },
    { id: '2', name: 'Pizza Napo', price: 1400000, category: 'Pizzas', stockType: 'recipe', isActive: true },
    { id: '3', name: 'Empanada Carne', price: 150000, category: 'Empanadas', stockType: 'direct', stock: 50, isActive: true },
    { id: '4', name: 'Empanada JyQ', price: 150000, category: 'Empanadas', stockType: 'direct', stock: 45, isActive: true },
    { id: '5', name: 'Coca Cola 1.5L', price: 350000, category: 'Bebidas', stockType: 'direct', stock: 100, isActive: true },
];

export default function ProductGrid() {
    const addItem = useCartStore(state => state.addItem);

    // Group by category helper logic could go here, but for grid we just list them

    return (
        <div className="animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Menú</h1>
                <p className="text-gray-400">Seleccioná los productos para agregar a la comanda.</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {MOCK_PRODUCTS.map((product) => (
                    <ProductCard key={product.id} product={product} onAdd={() => addItem(product)} />
                ))}
            </div>
        </div>
    );
}

function ProductCard({ product, onAdd }: { product: Product, onAdd: () => void }) {
    // Formatter for price
    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cents / 100);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Card
                className="h-[180px] flex flex-col p-4 cursor-pointer relative group bg-gradient-to-br from-kame-surface to-kame-gray hover:shadow-lg hover:shadow-kame-orange/5 border-transparent hover:border-kame-orange/30"
                onClick={onAdd}
            >
                <div className="flex-1">
                    <span className="text-xs font-medium text-kame-orange tracking-wider uppercase mb-1 block">
                        {product.category}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-end justify-between mt-4">
                    <span className="text-xl font-bold text-white">
                        {formatPrice(product.price)}
                    </span>
                    <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-kame-orange group-hover:text-black transition-colors">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </Card>
        </motion.div>
    );
}
