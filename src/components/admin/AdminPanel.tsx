import { useState } from 'react';
import { useCatalogStore } from '../../store/useCatalogStore';
import { Card } from '../ui/Card';
import { toast } from 'sonner';
import { Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
    const { products, ingredients, isLoading, error, createProduct, createIngredient, deleteProduct, deleteIngredient } = useCatalogStore();
    const [activeTab, setActiveTab] = useState<'products' | 'ingredients'>('products');

    return (
        <div className="bg-kame-dark min-h-screen text-white p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
                            data-testid="nav-pos"
                        >
                            <ArrowLeft className="text-kame-orange" />
                        </Link>
                        <h1 className="text-3xl font-bold">Panel de Administración</h1>
                    </div>

                    <div className="flex gap-2 bg-kame-surface p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-kame-orange text-black font-bold' : 'hover:text-white text-gray-400'}`}
                        >
                            Productos
                        </button>
                        <button
                            onClick={() => setActiveTab('ingredients')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ingredients' ? 'bg-kame-orange text-black font-bold' : 'hover:text-white text-gray-400'}`}
                        >
                            Ingredientes (Stock)
                        </button>
                    </div>
                </header>

                {isLoading && (
                     <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-kame-orange" />
                        <span className="ml-3 font-medium text-lg">Cargando datos...</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-500 mb-4">
                        Error: {error}
                    </div>
                )}

                {!isLoading && !error && (
                    activeTab === 'products' ? (
                        <ProductsManager products={products} onCreate={createProduct} onDelete={deleteProduct} />
                    ) : (
                        <IngredientsManager ingredients={ingredients} onCreate={createIngredient} onDelete={deleteIngredient} />
                    )
                )}
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

function ProductsManager({ products, onCreate, onDelete }: any) {
    const [formData, setFormData] = useState({
        name: '', price: 0, category: 'Pizzas', stockType: 'direct', stock: 0, recipe: [] as any[]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // Convert Price to Integer Cents
                price: Number(formData.price) * 100,
                stock: formData.stockType === 'direct' ? Number(formData.stock) : undefined,
                recipe: formData.stockType === 'recipe' ? formData.recipe : undefined
            };

            // Zod Validation happen inside store, but we can try catch
            await onCreate(payload);
            toast.success("Producto creado");
            // Reset form (simplified)
            setFormData({ name: '', price: 0, category: 'Pizzas', stockType: 'direct', stock: 0, recipe: [] });
        } catch (err: any) {
            toast.error("Error: " + err.message);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CREATE FORM */}
            <Card className="p-6 h-fit bg-kame-surface/50">
                <h3 className="font-bold text-xl mb-4 text-kame-orange">Nuevo Producto</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                        <input required className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-kame-orange outline-none"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Precio ($)</label>
                            <input required type="number" step="0.01" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-kame-orange outline-none"
                                value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Categoría</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-kame-orange outline-none"
                                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="Pizzas">Pizzas</option>
                                <option value="Empanadas">Empanadas</option>
                                <option value="Bebidas">Bebidas</option>
                                <option value="Postres">Postres</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Tipo de Stock</label>
                        <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-kame-orange outline-none"
                            value={formData.stockType} onChange={e => setFormData({ ...formData, stockType: e.target.value })}>
                            <option value="direct">Directo (Unidades)</option>
                            <option value="recipe">Receta (Ingredientes)</option>
                        </select>
                    </div>

                    {formData.stockType === 'direct' && (
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Stock Inicial</label>
                            <input type="number" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-kame-orange outline-none"
                                value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                        </div>
                    )}

                    {formData.stockType === 'recipe' && (
                        <div className="bg-black/20 p-2 rounded">
                            <p className="text-xs text-gray-400 mb-2">Ingredientes (Mock UI para MVP)</p>
                            {/* Recursive component or multiselect would go here in full version */}
                            <div className="text-xs text-yellow-500">
                                ⚠️ Selección de receta simplificada para MVP:
                                Se asignará ingrediente "Muzzarella" si existe para prueba.
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-kame-orange text-black font-bold py-2 rounded hover:bg-orange-400 transition-colors shadow-[0_0_15px_rgba(230,126,34,0.3)]">
                        Guardar Producto
                    </button>
                </form>
            </Card>

            {/* LIST */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p: any) => (
                    <Card key={p.id} className="p-4 flex justify-between items-center group hover:bg-white/5 transition-all">
                        <div>
                            <h4 className="font-bold">{p.name}</h4>
                            <p className="text-sm text-gray-400">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.price / 100)}</p>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300 border border-white/5">{p.stockType}</span>
                        </div>
                        <button onClick={() => onDelete(p.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded transition-all">
                            <Trash2 size={18} />
                        </button>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function IngredientsManager({ ingredients, onCreate, onDelete }: any) {
    const [name, setName] = useState('');
    const [stock, setStock] = useState(0);
    const [unit, setUnit] = useState('g');
    const [minStock, setMinStock] = useState(100);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onCreate({
                name,
                currentStock: Number(stock),
                minStock: Number(minStock),
                unit,
                costPerUnit: 1
            });
            toast.success("Ingrediente creado");
            setName(''); setStock(0);
        } catch (err: any) {
            toast.error("Error: " + err.message);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-6 h-fit bg-kame-surface/50">
                <h3 className="font-bold text-xl mb-4 text-kame-orange">Nuevo Ingrediente</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input required placeholder="Nombre (ej: Harina)" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-kame-orange outline-none"
                        value={name} onChange={e => setName(e.target.value)} />

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Stock Actual</label>
                            <input required type="number" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-kame-orange outline-none"
                                value={stock} onChange={e => setStock(Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Unidad</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-kame-orange outline-none"
                                value={unit} onChange={e => setUnit(e.target.value)}>
                                <option value="g">Gramos (g)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="u">Unidades (u)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Alerta Stock Mínimo</label>
                        <input required type="number" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-kame-orange outline-none"
                            value={minStock} onChange={e => setMinStock(Number(e.target.value))} />
                    </div>

                    <button type="submit" className="w-full bg-white text-black font-bold py-2 rounded hover:bg-gray-200 transition-colors">
                        Guardar Ingrediente
                    </button>
                </form>
            </Card>

            <div className="lg:col-span-2">
                <div className="overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 uppercase text-gray-400 font-bold">
                            <tr>
                                <th className="p-4">Ingrediente</th>
                                <th className="p-4">Stock Actual</th>
                                <th className="p-4">Unidad</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {ingredients.map((i: any) => {
                                const isLowStock = i.currentStock < i.minStock;
                                const isCritical = i.currentStock < (i.minStock * 0.2);

                                return (
                                    <tr key={i.id} className={`group transition-colors ${isCritical ? 'bg-red-900/20' : 'hover:bg-white/5'}`}>
                                        <td className="p-4 font-medium">{i.name}</td>
                                        <td className={`p-4 font-mono font-bold ${isLowStock ? 'text-red-400' : 'text-green-400'}`}>
                                            {i.currentStock}
                                        </td>
                                        <td className="p-4 text-gray-400">{i.unit}</td>
                                        <td className="p-4 text-center">
                                            {isCritical ? (
                                                <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-bold border border-red-500/20 animate-pulse">
                                                    CRÍTICO
                                                </span>
                                            ) : isLowStock ? (
                                                <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20">
                                                    BAJO
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold border border-green-500/20">
                                                    OK
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => onDelete(i.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {ingredients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                        No hay ingredientes registrados en el inventario.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
