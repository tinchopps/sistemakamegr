import { forwardRef } from 'react';
import type { Sale } from '../schemas/sale.schema';

interface ThermalTicketProps {
    sale: (Sale & { id?: string }) | null;
}

export const ThermalTicket = forwardRef<HTMLDivElement, ThermalTicketProps>(({ sale }, ref) => {
    if (!sale) return null;

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cents / 100);
    };

    return (
        <div ref={ref} className="hidden print:block print:w-[80mm] print:p-2 font-mono text-black text-xs leading-tight">
            <div className="text-center mb-4">
                <h1 className="font-bold text-xl uppercase mb-1">KAME</h1>
                <p>Comidas Ricas</p>
                <p className="text-[10px] mt-1">{sale.createdAt ? new Date(sale.createdAt).toLocaleString() : new Date().toLocaleString()}</p>
                <p className="text-[10px]">Ticket Venta #{sale.id?.slice(-6) ?? '---'}</p>
            </div>

            <hr className="border-t border-black border-dashed my-2" />

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-black text-[10px]">
                        <th className="w-8">Cant</th>
                        <th>Prod</th>
                        <th className="text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="text-[10px]">
                    {sale.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="align-top">{item.quantity}</td>
                            <td className="align-top pr-1">{item.productName}</td>
                            <td className="align-top text-right whitespace-nowrap">{formatPrice(item.subtotal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr className="border-t border-black border-dashed my-2" />

            <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>{formatPrice(sale.totalAmount)}</span>
            </div>

            {sale.discountAmount > 0 && (
                <div className="flex justify-between text-[10px]">
                    <span>Descuentos</span>
                    <span>-{formatPrice(sale.discountAmount)}</span>
                </div>
            )}

            {sale.paymentMethods.map((pm, i) => (
                <div key={i} className="flex justify-between text-[10px] uppercase mt-1">
                    <span>{pm.method === 'cash' ? 'Efectivo' : 'Transf.'}</span>
                    <span>{formatPrice(pm.amount)}</span>
                </div>
            ))}

            <div className="text-center mt-6 mb-2">
                <p className="font-bold">¡GRACIAS POR SU COMPRA!</p>
                <p className="text-[10px]">www.sistemakame.com</p>
            </div>
        </div>
    );
});

ThermalTicket.displayName = 'ThermalTicket';
