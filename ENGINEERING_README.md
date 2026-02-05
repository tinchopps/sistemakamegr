# 🏗️ Sistema Kame - Documentación de Ingeniería

Este documento detalla las decisiones arquitectónicas críticas tomadas para garantizar la robustez financiera, la integridad de datos y la resiliencia operativa del Sistema Kame.

## 1. Integridad Financiera (Zero-Float Precision)

### El Problema
JavaScript maneja los números bajo el estándar IEEE 754 (coma flotante), lo que introduce errores de precisión conocidos en operaciones monetarias (ej: `0.1 + 0.2 === 0.30000000000000004`). En un sistema POS, esto es inaceptable.

### La Solución: Integer-Based Math
Todos los valores monetarios en el sistema (precios, subtotales, reportes de caja) se almacenan y operan exclusivamente como **ENTEROS (Centavos)**.

- **Base de Datos**: `$150.50` se guarda como `15050`.
- **Cálculos**: Sumas y restas ocurren sin decimales.
- **Frontend**: Solo se divide por 100 y formatea al momento de renderizar (`Intl.NumberFormat`).

Esto garantiza precisión absoluta en el arqueo de caja y reportes contables.

## 2. Integridad Transaccional y Stock Híbrido

### Modelo de Stock
El sistema soporta un modelo híbrido complejo:
1.  **Stock Directo**: Productos terminados (ej. Coca Cola). Se descuenta 1 unidad del producto.
2.  **Recetas (BOM)**: Productos elaborados (ej. Pizza) que descuentan N ingredientes (Muzzarella, Harina) del inventario de materia prima.

### Atomicidad (`runTransaction`)
Dado que el descuento de stock ocurre mediante lógica de cliente (para mantener el Tier Spark de Firebase), mitigar _Race Conditions_ es crítico. Si dos cajeros venden la misma última pizza simultáneamente, el stock no debe bajar de cero.

Implementamos `runTransaction` de Firestore para garantizar Atomicidad (ACID):
1.  **Lectura Bloqueante**: Se leen los estados actuales de TODOS los productos e ingredientes involucrados.
2.  **Validación en Memoria**: Se verifica si `currentStock - required >= 0`.
3.  **Rollback Automático**: Si un solo ingrediente carece de stock, la transacción entera se aborta con error `STOCK_INSUFFICIENTE`.
4.  **Escritura Simultánea**: La creación de la Venta y la actualización de Inventarios ocurren en el mismo instante lógico.

## 3. Inmutabilidad Histórica (Snapshots)

El historial de ventas debe ser inalterable. Si el precio de la "Pizza Muzza" cambia mañana, las ventas de ayer deben reflejar el precio de ayer.

En la colección `sales`, no guardamos referencias vivas a productos, sino **Snapshots completos**:
```typescript
items: [{
  productId: "xyz",
  productName: "Pizza Muzza", // Copiado tal cual estaba al vender
  unitPrice: 1200000,         // Precio congelado
  category: "Pizzas"          // Categoría congelada para reportes históricos
}]
```
Esto asegura que los reportes de ventas sean consistentes en el tiempo, independientemente de la evolución del catálogo ABM.

## 4. Validación de Contrato (Type Safety)

Utilizamos **Zod** como capa de validación defensiva. Nada llega a Firestore sin pasar por un esquema estricto.

- `SaleSchema`: Valida que la suma de los items coincida matemáticamente con el `totalAmount`. Impide inyecciones de precios modificados desde el cliente.
- `ProductSchema`: Fuerza que los precios sean enteros positivos.

## 5. Resiliencia Offline

El sistema está configurado para operar en entornos de conectividad inestable (Notebooks con Wi-Fi intermitente).
Se habilita `persistentLocalCache` de Firestore:
- El POS puede seguir leyendo el catálogo cacheado.
- Las ventas se encolan localmente y se sincronizan (y validan) apenas se recupera conexión.

---
**Stack Tecnológico:** React 19, TypeScript, Vite, Firebase (Firestore/Auth), Zustand, Tailwind CSS.
