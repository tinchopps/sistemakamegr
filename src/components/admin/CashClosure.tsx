import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.config';
import { Card } from '../ui/Card';
import { toast } from 'sonner';
import { DollarSign, Save, Loader2, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CashClosure() {
    const [declaredCash, setDeclaredCash] = useState('');
    const [declaredTransfer, setDeclaredTransfer] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<null | { systemTotal: number, diff: number }>(null);

    // Mocked for MVP - In real app, this comes from Context/Auth
    const CURRENT_SHIFT_ID = 'mock-shift-id';
    const USER_ID = 'mock-user-id';

    const handleClosure = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const cashVal = Math.round(Number(declaredCash) * 100);
            const transferVal = Math.round(Number(declaredTransfer) * 100);

            // 1. Calculate System Totals for this Shift
            // CAUTION: In production this should be a Cloud Function or Aggregation Query
            const q = query(collection(db, "sales"), where("shiftId", "==", CURRENT_SHIFT_ID), where("status", "!=", "cancelled"));
            const snapshot = await getDocs(q);

            let systemCash = 0;
            let systemTransfer = 0;
            let salesCount = 0;

            snapshot.forEach(doc => {
                const sale = doc.data();
                salesCount++;
                sale.paymentMethods.forEach((pm: any) => {
                    if (pm.method === 'cash') systemCash += pm.amount;
                    else systemTransfer += pm.amount;
                });
            });

            const systemTotal = systemCash + systemTransfer;
            const declaredTotal = cashVal + transferVal;
            const difference = declaredTotal - systemTotal;

            // 2. Create Closure Document
            await addDoc(collection(db, "cash_shifts"), {
                shiftId: CURRENT_SHIFT_ID,
                closedAt: serverTimestamp(),
                closedBy: USER_ID,

                declaredCash: cashVal,
                declaredTransfer: transferVal,
                declaredTotal,

                systemCash,
                systemTransfer,
                systemTotal,

                difference,
                salesCount,
                status: 'closed'
            });

            setResult({ systemTotal, diff: difference });
            toast.success("Caja cerrada exitosamente");

        } catch (error: any) {
            console.error(error);
            toast.error("Error al cerrar caja: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cents / 100);
    };

    return (
        <div className="min-h-screen bg-kame-dark text-white p-6 flex flex-col items-center justify-center">
            <Link to="/" className="absolute top-6 left-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
                <Home />
            </Link>

            <Card className="w-full max-w-md p-8 bg-kame-surface border-kame-orange/20 shadow-2xl shadow-black">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-full bg-kame-orange/10 text-kame-orange mb-4">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold">Cierre de Caja (Arqueo)</h1>
                    <p className="text-gray-400 text-sm mt-1">Turno actual: {CURRENT_SHIFT_ID}</p>
                </div>

                {!result ? (
                    <form onSubmit={handleClosure} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Efectivo en Caja (Declarado)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    required type="number" step="0.01"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-8 text-lg font-mono focus:border-kame-orange outline-none transition-colors"
                                    value={declaredCash} onChange={e => setDeclaredCash(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Total Transferencias (Declarado)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    required type="number" step="0.01"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-8 text-lg font-mono focus:border-kame-orange outline-none transition-colors"
                                    value={declaredTransfer} onChange={e => setDeclaredTransfer(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full py-4 bg-kame-orange hover:bg-orange-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save />}
                            CONFIRMAR Y CERRAR
                        </button>
                    </form>
                ) : (
                    <div className="animate-in zoom-in duration-300">
                        <div className={`text-center p-6 rounded-xl border ${result.diff === 0 ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                            <h3 className="text-lg font-bold mb-2">Resultado del Arqueo</h3>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Esperado (Sistema):</span>
                                <span>{formatPrice(result.systemTotal)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2 mt-2">
                                <span>Diferencia:</span>
                                <span className={result.diff === 0 ? 'text-green-400' : 'text-red-400'}>
                                    {result.diff > 0 ? '+' : ''}{formatPrice(result.diff)}
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setResult(null)} className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium">
                            Volver
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
}
