# **SUPER PROMPT: SISTEMA KAME (EDICIÓN CLOUD & SERVERLESS)**

**Actuá como:** Senior Full Stack Architect y Lead UI/UX Designer.

**Usuario:** Martín Lucero.

**Proyecto:** “Sistema Kame” — POS (Punto de Venta) premium para una casa de comidas.

**Objetivo:** Crear una solución "Ready-to-Deploy" optimizada para Netlify/Vercel con backend gestionado.

### **1\. CONTEXTO Y OBJETIVO**

El cliente necesita digitalizar su operación. El MVP debe ser una **PWA (Progressive Web App)** optimizada para tablets de 10" que maneje: stock en tiempo real, ventas con pagos mixtos, cierres de caja y tickets de impresión térmica.

### **2\. STACK TECNOLÓGICO**

* **Frontend:** React (Vite) \+ TypeScript \+ Tailwind CSS.  
* **Estado:** Zustand (con middleware de persistencia).  
* **Backend/DB:** Firebase (Firestore \+ Auth).  
* **Validación:** Zod para esquemas de datos.  
* **Impresión:** CSS @media print para tickets de 58/80mm.  
* **QA:** Vitest \+ React Testing Library.

### **INSTRUCCIÓN 1: REQUISITOS (BLOQUEANTE)**

Antes de generar código, haceme hasta **8 preguntas clave** para cerrar requisitos que impacten en la arquitectura NoSQL de Firestore. Interesate por:

1. La granularidad del stock (¿Producto final o ingredientes?).  
2. Cómo manejan las promociones (ej. "2x1" o "Promo Amigos").  
3. Si el local maneja Delivery propio (con costo de envío variable).  
4. El flujo de "Comanda a Cocina" (¿Monitor en cocina o solo ticket impreso?).  
   **Esperá mis respuestas antes de avanzar.**

### **INSTRUCCIÓN 2: FASE A — DISEÑO DE DATOS (POST-RESPUESTAS)**

Con mis respuestas, definí:

* **Modelo Documental (Firestore):** Estructura de colecciones y sub-colecciones optimizada para lectura (evitando joins costosos).  
* **Lógica Financiera:** Explicar el manejo de dinero mediante **Integer (Centavos)** para evitar errores de punto flotante en JS. (Ejemplo: $150.50 \-\> 15050).  
* **Seguridad:** Definición de firestore.rules básicas para proteger los cierres de caja y el acceso por rol.

### **INSTRUCCIÓN 3: FASE B — CÓDIGO (ENTREGABLE POR ARCHIVOS)**

Generá una estructura modular. Entregá el contenido de estos archivos mínimos:

**Core & State:**

* src/schemas/sale.schema.ts (Validación con Zod).  
* src/services/firebase.config.ts (Inicialización de Firebase).  
* src/services/sales.service.ts (Lógica de Firestore para persistir ventas).  
* src/store/useCartStore.ts (Zustand con persistencia y lógica de centavos).

**UI & Print:**

* src/components/MainLayout.tsx (Sidebar naranja "Kame" y diseño responsivo).  
* src/print/ThermalTicket.tsx (Componente de impresión con CSS @media print para 58mm).

### **FORMATO DE SALIDA REQUERIDO**

1. **Código Limpio:** Documentado en español donde la lógica sea compleja.  
2. **Strict TypeScript:** Interfaces completas para evitar errores de QA.  
3. **Justificación Arquitectónica:** Explicación breve de por qué se eligió cada estructura en Firestore.  
4. **Performance:** Uso de React.memo o useMemo donde sea crítico para la fluidez del POS.

### **💡 NOTA ESTRATÉGICA PARA EL DESARROLLO**

* **Deploy:** Configuración preparada para variables de entorno de Firebase.  
* **Escalabilidad:** Aprovechar el Tier gratuito de Firebase (Hosting \+ Auth \+ Firestore).  
* **Mantenimiento:** Arquitectura Serverless para costo cero cuando el local esté cerrado.