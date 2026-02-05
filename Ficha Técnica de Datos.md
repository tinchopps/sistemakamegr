# **📊 Especificaciones de Datos y Lógica \- Sistema Kame (Firebase Edition)**

Este documento contiene la verdad técnica del proyecto para asegurar consistencia en la nueva implementación.

## **1\. Estructura de Colecciones (Firestore)**

### **products (Documento)**

* id: string (auto)  
* name: string  
* price: number (enviado como decimal)  
* min\_stock: number (default: 5\)  
* category: string (Pizzas, Empanadas, Bebidas, etc.)  
* is\_active: boolean

### **stock\_movements (Documento)**

* id: string  
* product\_id: reference  
* quantity: number  
* type: string ('input', 'sale', 'adjustment')  
* timestamp: serverTimestamp  
* user\_id: string

### **sales (Documento)**

* id: string  
* user\_id: string  
* items: array \[ {product\_id, name, quantity, unit\_price} \]  
* total: number  
* discount: number  
* payment\_methods: array \[ {method: 'cash'|'transfer', amount: number} \]  
* status: string ('pending', 'completed', 'cancelled')  
* created\_at: serverTimestamp

### **closures (Documento)**

* id: string  
* date: string (YYYY-MM-DD)  
* total\_cash: number  
* total\_transfer: number  
* total\_sales: number  
* orders\_count: number  
* average\_ticket: number  
* performed\_by: string (user\_id)

## **2\. Reglas de Negocio Obligatorias**

| Concepto | Regla Técnica |
| :---- | :---- |
| **Precisión Monetaria** | Multiplicar por 100 al guardar y dividir por 100 al mostrar, o usar librerías de precisión decimal. |
| **Alertas de Stock** | UI\_State \= (current\_stock \<= min\_stock) ? 'CRITICAL' : 'OK' |
| **Pagos Mixtos** | La suma de payment\_methods\[\].amount debe ser exactamente igual a total \- discount. |
| **Seguridad (Auth)** | Solo el rol admin puede borrar ventas o editar precios. El staff solo crea ventas. |
| **Zustand Persist** | El carrito debe persistir en localStorage por si se refresca la página por error. |

## **3\. Glosario de Colores (Design Tokens)**

* **Primary:** \#E67E22 (Naranja Kame)  
* **Background:** \#000000 (Black)  
* **Surface:** \#121212 (Dark Gray)  
* **Success:** \#27AE60 (Emerald)  
* **Error:** \#E74C3C (Alizarin)