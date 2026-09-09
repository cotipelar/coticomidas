# 🥟 coticomidas - Gestor de Costos, Recetas y Pedidos

Aplicación web interactiva y moderna desarrollada para gestionar los costos de producción, actualizar precios de insumos en tiempo real y calcular la ganancia neta y lista de compras de cada pedido o tanda de cocina para el emprendimiento gastronómico coticomidas.

---

## 🚀 Cómo Iniciar la Aplicación

La aplicación ya está compilada y lista. Para iniciarla cuando quieras:

```bash
# Entrar a la carpeta del proyecto
cd /Users/leonel/Desktop/Proyectos/coti

# Iniciar el servidor local
npm run dev
```

* **En tu computadora:** Abre en el navegador [http://localhost:5173](http://localhost:5173)
* **En el celular de Coti (en el mismo Wi-Fi):** Abre la dirección IP que muestra la terminal (por ejemplo `http://192.168.100.8:5173`). ¡Es 100% responsiva y se adapta a la pantalla del teléfono!

---

## ✨ Características Principales

### 1. 🛒 Toma de Pedidos y Calculadora en Tiempo Real
* **Armar pedidos al instante:** Selector interactivo con botones `+` y `-` para cada comida (Empanadas, Comidas, Postres, Budines).
* **Totales en vivo:**
  * **Venta Total ($)**
  * **Costo de Insumos ($)**
  * **Ganancia Limpia ($)**
  * **Margen de Ganancia (%)**
* **Lista de Compras Automática:** Calcula en gramos, kilos o unidades la cantidad exacta de carne, cebolla, potes descartables, tapas o huevos que hacen falta comprar para esa tanda.
* **Compartir por WhatsApp con 1 click:**
  * **Botón "WhatsApp Cliente":** Genera un mensaje prolijo con el detalle de comidas y total a pagar para mandarle al cliente.
  * **Botón "Detalle Ganancia":** Genera un resumen interno con el costo y ganancia neta para ustedes.
* **Historial de Pedidos:** Guarda pedidos con estados (*Pendiente*, *En preparación*, *Listo*, *Entregado*, *Cobrado*).
* **Compras Consolidadas:** Permite tildar varios pedidos a la vez y ver la lista de compras combinada de todo el fin de semana.

### 2. 🍲 Fichas Técnicas de Comidas y Recetas
* **Permite agregar comidas nuevas** con el botón `+ Nueva Comida / Receta`.
* **Permite modificar cualquier receta existente:**
  * Ajustar o cambiar ingredientes y gramajes.
  * Cambiar el rendimiento del lote (ej. 1 docena, 4 potes, 2 budines).
  * Agregar o quitar descartables (bandejas, potes, bolsas, moldes).
* **Ajustar precios de venta:** Puedes editar el precio de venta en la ficha o directamente haciendo click sobre el número en la tarjeta.
* **Cálculo de ganancia unitaria y margen porcentual automático.**

### 3. 🛒 Despensa de Insumos (Efecto Cascada)
* Lista de todos los insumos de carnicería, verdulería, almacén, lácteos y descartables.
* Ingresas el precio tal como lo pagaste en el paquete/bulto (ej: Queso crema $41.525 por balde de 3.5 kg, o Aceite $13.637 por 3L).
* **Efecto multiplicador:** Si la carne, el queso o las tapas suben de precio, lo modificas en un solo lugar y **se actualiza automáticamente el costo y ganancia de todas las comidas que lo llevan**.

### 4. 📊 Tablero de Rentabilidad y Métricas
* Ranking de las comidas que más plata dejan en mano ($).
* Ranking de las comidas con mayor margen de ganancia (%).
* Facturación acumulada, costos y ganancias totales históricas.
* Consejos de rentabilidad para potenciar el negocio.

### 5. 💾 Seguridad y Copias de Respaldo
* Todos los cambios se guardan automáticamente en el navegador (`LocalStorage`).
* Botón de **Descargar Backup (JSON)** para guardar una copia en tu compu.
* Botón de **Restaurar Backup** para subirla en cualquier momento o pasarla a otra compu.
* Botón de **Restaurar datos iniciales** si alguna vez quieren volver al estado original del Excel.
