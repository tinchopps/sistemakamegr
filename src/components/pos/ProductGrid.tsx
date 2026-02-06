import { useCartStore } from '../../store/useCartStore';
import { useCatalogStore } from '../../store/useCatalogStore';
import type { Product } from '../../schemas/product.schema';
import { Card } from '../ui/Card';
import { Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductGrid() {
    const addItem = useCartStore(state => state.addItem);
    const { products, isLoading, error } = useCatalogStore();

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Menú</h1>
                <p className="text-gray-400 text-lg">Seleccioná los productos para agregar a la comanda.</p>
            </header>

            {isLoading && (
                <div className="flex items-center justify-center py-20 text-white">
                    <Loader2 className="w-10 h-10 animate-spin text-kame-orange" />
                    <span className="ml-3 font-medium text-lg">Cargando menú...</span>
                </div>
            )}

            {error && (
                <div className="flex items-center justify-center py-20 text-red-500 bg-red-500/10 rounded-2xl border border-red-500/20">
                    <p className="font-bold">Error: {error}</p>
                    <p className="text-sm ml-2 opacity-80">(Verificá la conexión o configuración)</p>
                </div>
            )}

            {!isLoading && !error && products.length === 0 && (
                <div className="text-center p-10 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                    <p className="text-gray-400 text-lg">No hay productos disponibles.</p>
                    <p className="text-sm text-gray-500 mt-2">Agregá productos desde el Panel de Administración.</p>
                </div>
            )}

            {!isLoading && !error && products.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} onAdd={() => addItem(product)} />
                    ))}
                </div>
            )}
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
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
        >
            <Card
                className="h-[200px] flex flex-col p-5 cursor-pointer relative group bg-[#1E1E1E] border border-white/5 hover:border-kame-orange/50 shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300"
                onClick={onAdd}
            >
                {/* Decoration Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="flex-1 z-10">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-kame-orange bg-kame-orange/10 tracking-wider uppercase mb-2 border border-kame-orange/20">
                        {product.category}
                    </span>
                    <h3 className="text-xl font-bold text-white leading-tight line-clamp-2">
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-end justify-between mt-4 z-10">
                    <span className="text-2xl font-black text-white tracking-tight">
                        {formatPrice(product.price)}
                    </span>
                    <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-kame-orange group-hover:text-black transition-all shadow-lg group-hover:shadow-orange-500/20">
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </Card>
        </motion.div>
    );
}
