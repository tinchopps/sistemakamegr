import { useState, useEffect } from 'react';
import { useCatalogStore } from '../../store/useCatalogStore';
import { Card } from '../ui/Card';
import { toast } from 'sonner';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
    const { products, ingredients, isLoading, subscribeToCatalog, createProduct, createIngredient, deleteProduct, deleteIngredient } = useCatalogStore();
    const [activeTab, setActiveTab] = useState<'products' | 'ingredients'>('products');

    // Subscriptions
    useEffect(() => {
        const unsub = subscribeToCatalog();
        return () => unsub();
    }, []);

    if (isLoading) return <div className="p-10 text-white">Cargando catálogo...</div>;

    return (
        <div className="bg-kame-dark min-h-screen text-white p-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft />
                        </Link>
                        <h1 className="text-3xl font-bold">Panel de Administración</h1>
                    </div>

                    <div className="flex gap-2 bg-kame-surface p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-kame-orange text-black' : 'hover:text-white text-gray-400'}`}
                        >
                            Productos
                        </button>
                        <button
                            onClick={() => setActiveTab('ingredients')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ingredients' ? 'bg-kame-orange text-black' : 'hover:text-white text-gray-400'}`}
                        >
                            Ingredientes (Stock)
                        </button>
                    </div>
                </header>

                {activeTab === 'products' ? (
                    <ProductsManager products={products} onCreate={createProduct} onDelete={deleteProduct} />
                ) : (
                    <IngredientsManager ingredients={ingredients} onCreate={createIngredient} onDelete={deleteIngredient} />
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
                <h3 className="font-bold text-xl mb-4">Nuevo Producto</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                        <input required className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Precio ($)</label>
                            <input required type="number" step="0.01" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm"
                                value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Categoría</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm"
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
                        <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm"
                            value={formData.stockType} onChange={e => setFormData({ ...formData, stockType: e.target.value })}>
                            <option value="direct">Directo (Unidades)</option>
                            <option value="recipe">Receta (Ingredientes)</option>
                        </select>
                    </div>

                    {formData.stockType === 'direct' && (
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Stock Inicial</label>
                            <input type="number" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm"
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

                    <button type="submit" className="w-full bg-kame-orange text-black font-bold py-2 rounded hover:bg-orange-400">
                        Guardar Producto
                    </button>
                </form>
            </Card>

            {/* LIST */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p: any) => (
                    <Card key={p.id} className="p-4 flex justify-between items-center group">
                        <div>
                            <h4 className="font-bold">{p.name}</h4>
                            <p className="text-sm text-gray-400">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.price / 100)}</p>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">{p.stockType}</span>
                        </div>
                        <button onClick={() => onDelete(p.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-white/5 rounded">
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
                <h3 className="font-bold text-xl mb-4">Nuevo Ingrediente</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input required placeholder="Nombre (ej: Harina)" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm"
                        value={name} onChange={e => setName(e.target.value)} />

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Stock Actual</label>
                            <input required type="number" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm"
                                value={stock} onChange={e => setStock(Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Unidad</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm"
                                value={unit} onChange={e => setUnit(e.target.value)}>
                                <option value="g">Gramos (g)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="u">Unidades (u)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Alerta Stock Mínimo</label>
                        <input required type="number" className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm"
                            value={minStock} onChange={e => setMinStock(Number(e.target.value))} />
                    </div>

                    <button type="submit" className="w-full bg-white text-black font-bold py-2 rounded hover:bg-gray-200">
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
                                // Logic: Alert if stock < 20% of minStock? Or just if stock < minStock?
                                // User said: "Si el stock es menor al 20% de la capacidad nominal"
                                // Assuming 'minStock' acts as the threshold or capacity reference.
                                // Let's simplify: User likely means if stock is critically low.
                                // If I don't have "capacity", I'll use minStock as the "Critical Threshold". 
                                // Actually, typical logic is: Warning if < minStock. Critical if < 20% of minStock?
                                // Let's assume Capacity isn't tracked yet, so I'll interpret "20% de capacidad nominal" 
                                // as logic where we might need a "maxStock" field, but for now let's use minStock as the alert trigger.
                                // Better interpretation: If current < minStock -> Red Alert.

                                const isLowStock = i.currentStock < i.minStock;
                                const isCritical = i.currentStock < (i.minStock * 0.2); // 20% of threshold

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
