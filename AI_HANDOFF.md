# AI HANDOFF DOCUMENTATION

## 1. Stack Tecnológico

| Componente | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Runtime** | Node.js | v20+ Recomendado |
| **Framework** | React + Vite | React 19, Vite 7 (TS) |
| **Lenguaje** | TypeScript | Strict Typing Check |
| **Estilos** | Tailwind CSS | v4, PostCSS |
| **Base de Datos** | Firebase Firestore | `src/services/firebase.config.ts` |
| **Estado Global** | Zustand | `src/store/` |
| **Testing** | Playwright | Full E2E & Visual Regression |
| **Iconos** | Lucide React | |

## 2. Arquitectura de Carpetas

- **`/src`**: Código fuente principal.
  - **`/components`**: UI Components (reutilizables).
  - **`/store`**: Manejo de estado global (Zustand). (`useCatalogStore.ts`)
  - **`/services`**: Lógica de negocio y conexión a Firebase.
    - `sales.service.ts`: Transacciones atómicas de ventas.
    - `firebase.config.ts`: Inicialización de Firebase App y Db.
  - **`/schemas`**: Validaciones Zod (Product, Ingredient, Sale).
  - **`/types`**: Definiciones de tipos TypeScript globales.
- **`/tests`**: Tests End-to-End y de Regresión con Playwright.
  - `regression.spec.ts`: Suite principal de pruebas visuales y funcionales.
- **`/public`**: Assets estáticos.

## 3. Flujo de Datos Principal

> [!IMPORTANT]
> **Corazón de la Reactividad**: `useCatalogStore.ts` es la fuente de la verdad para el frontend.
> Si se manipula el stock o los productos sin pasar por este Store (o sin que este reaccione a los cambios de Firebase), **se rompe la reactividad del Ticket de Venta**.
> Jules, asegurate de que cualquier cambio en la UI que dependa de datos use los selectores de este store.

1.  **Lectura**: El estado global de productos e ingredientes se gestiona en `useCatalogStore.ts`. Se suscribe en tiempo real (`onSnapshot`) a las colecciones `products` y `ingredients` de Firestore.
2.  **Escritura (Ventas)**: `SalesService.createSale` ejecuta una transacción atómica (`runTransaction`).
    -   Lee stock actual de todos los productos e ingredientes involucrados.
    -   Calcula deducciones (directas o por receta).
    -   Verifica atomicamente que el stock no sea negativo (lanza `STOCK_INSUFFICIENTE` si falla).
    -   Actualiza stocks y crea el documento de venta en una sola operación.

## 4. Comandos Estandarizados

Para que Jules (o cualquier dev) pueda trabajar:

- **Instalar dependencias**: `npm install`
- **Modo Desarrollo**: `npm run dev` (Levanta en http://localhost:5173)
- **Compilar**: `npm run build` (Type check TS + Vite Build)
- **Testear**: `npm run test` (Corre Playwright en modo Headless)
- **Testear con UI**: `npm run test:ui` (Para debug visual)
- **Linter/TypeCheck**: `npm run lint` (Corre `tsc --noEmit`)

## 5. Definition of Done (DoD)

Para considerar una tarea terminada, se debe cumplir:

1.  **Código Compilado**: `npm run build` debe pasar sin errores.
2.  **Tests Aprobados**: `npm run test` debe pasar en verde (100% pass).
    -   Incluye chequeos visuales de "Gold Standard" (Modo oscuro estricto, paleta correcta).
3.  **Estilos Correctos**:
    -   Uso de Naranja Kame (#E67E22) para acciones principales (Botones de cobro).
    -   Fondo Dark Mode estricto (#000000 o #121212).
4.  **Sin Errores de Tipado**: `npm run lint` limpio.

## 6. Configuración de Entorno

Copiar `.env.example` a `.env.local` y completar las variables de Firebase. El proyecto no arrancará correctamente sin estas credenciales.
