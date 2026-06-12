# Mejoras y Pruebas Aplicadas - BarResPos-Nando-Food

Este documento resume las optimizaciones de rendimiento, correcciones de bugs y la estrategia de control de calidad (QA) implementadas en el sistema para asegurar una entrega estable y fluida al cliente.

---

## 1. Optimización de Base de Datos SQLite (Rendimiento bajo Carga)

Para evitar que el sistema se congele o muestre errores de "Base de datos bloqueada" (`database is locked` / `SQLITE_BUSY`) el fin de semana por el tráfico concurrente de los meseros, se aplicaron dos mejoras clave en **`Program.cs`**:

1.  **Habilitación del Modo WAL (Write-Ahead Logging)**:
    *   *Qué hace*: Permite que la base de datos maneje lecturas y escrituras simultáneas sin bloquearse mutuamente.
    *   *Implementación*: Se inyectó el comando SQL nativo `PRAGMA journal_mode=WAL;` inmediatamente después de ejecutar las migraciones iniciales de Entity Framework.
2.  **Ajuste de Cadena de Conexión (Timeout y Caché)**:
    *   *Qué hace*: Incrementa la resiliencia de las conexiones concurrentes compartiendo la caché en memoria y dando un margen de espera a los meseros antes de lanzar error.
    *   *Implementación*: Se actualizó la cadena de conexión del backend a:
        `Data Source=barrestpos.db;Cache=Shared;Mode=ReadWriteCreate;Busy Timeout=5000;`

---

## 2. Corrección del Bug de Cocina (KDS)

*   **El Bug**: Cuando un mesero agregaba una comida al carrito en el POS, el plato aparecía instantáneamente en la pantalla de la cocina (KDS) antes de presionar el botón "Enviar Cocina" (debido al auto-guardado preventivo).
*   **La Causa**: La API de cocina (`CocinaApiController.cs`) listaba cualquier orden activa filtrando únicamente los estados `Pagado` y `Cancelado`. Los borradores temporales en estado `Pendiente` (salón) y `Guardado` (delivery) se colaban a la cocina.
*   **La Solución**: Se modificó el filtro de obtención de comandas en **`CocinaApiController.cs`** para ignorar explícitamente los estados borrador de pedidos que aún no han sido confirmados por el mesero:
    ```csharp
    .Where(f => f.Estado != SD.EstadoOrdenPagado 
             && f.Estado != SD.EstadoOrdenCancelado 
             && f.Estado != SD.EstadoOrdenPendiente 
             && f.Estado != SD.EstadoOrdenGuardado)
    ```
    *   *Resultado*: Ahora la cocina solo verá el pedido cuando el mesero presione el botón **"Enviar Cocina"** en el POS, lo que cambia la orden a estado `En Cocina` y los items a `En Preparación`.

---

## 3. Automatización de Pruebas (QA - Playwright)

Se implementó el andamiaje para realizar pruebas de interfaz de usuario de forma automatizada:

1.  **`playwright.config.js` (Raíz)**:
    *   Configura el puerto local de Vite (`http://localhost:5173`) y define que las pruebas se ejecuten en secuencia (`workers: 1`, `fullyParallel: false`) para no corromper la base de datos de pruebas SQLite en local.
2.  **`tests/pos.spec.js`**:
    *   *Prueba 1 (Acceso)*: Valida el inicio de sesión exitoso con credenciales correctas (`admin` / `admin`) y confirma la redirección automática al Dashboard.
    *   *Prueba 2 (Seguridad)*: Valida el rechazo de credenciales incorrectas y la permanencia segura en la pantalla de Login.
    *   *Prueba 3 (Rol Mesero)*: Valida que al iniciar sesión como Mesero (`mesero1`), la interfaz limite el acceso y solo muestre en el menú las opciones de "Mesas" y "Delivery", ocultando los módulos administrativos.
    *   *Prueba 4 (Rol Cocinero)*: Valida que al iniciar sesión como Cocinero (`cocina1`), el menú de navegación restrinja todo y muestre exclusivamente la pantalla de "Cocina".
3.  **`tests/inventory.spec.js`**:
    *   *Flujo Completo*: Realiza un ciclo completo automatizado que abarca:
        *   Creación de una categoría única.
        *   Creación de un producto con opciones especiales con y sin precio adicional (ej. "Extra Queso" y "Sin Cebolla").
        *   Realización de una Entrada de Stock (ajuste positivo) y validación del nuevo stock.
        *   Realización de una Salida de Stock por daño (ajuste negativo) y validación del nuevo stock.
        *   Selección de una mesa ("SALA 1") mediante doble clic en el plano del POS, selección de opciones especiales y agregado al carrito.
        *   Envío de la orden a cocina y confirmación de que la comanda aparece correctamente en tiempo real en la pantalla de Cocina (KDS).
        *   Marcado de la comanda como "Listo" en KDS para que cambie de estado.
        *   Retorno al POS para procesar la orden y cobrar la mesa, dejándola libre de nuevo.
        *   Verificación de la actualización de ventas reflejada en el Dashboard.

---

## 4. Seguridad del Sistema (Vulnerabilidades de Dependencias)

*   **El Problema**: El proyecto utilizaba la biblioteca de procesamiento de imágenes `SixLabors.ImageSharp` en su versión `2.1.9`, la cual contenía vulnerabilidades de seguridad conocidas de gravedad alta y moderada (como denegación de servicio / GHSA-2cmq-823j-5qj8).
*   **La Solución**: Se actualizó la dependencia a la versión `2.1.10` en el archivo de proyecto [BarRestPOS.csproj](file:///C:/Users/william/Music/BarResPos-Nando-Food-Backend/BarRestPOS.csproj).
*   **Resultado**: La compilación ahora se realiza con **0 Advertencias de seguridad** y **0 Errores**, asegurando que el backend no tenga brechas conocidas en el manejo de imágenes o procesamiento de archivos.

---

---

## 5. Plan de Pruebas Manual Completo

Para realizar pruebas manuales detalladas de cada módulo del sistema antes del despliegue, puedes consultar el documento explicativo de QA en tu carpeta de trabajo:
*   [plan_maestro_de_pruebas.md](file:///C:/Users/william/.gemini/antigravity-ide/brain/8a33165d-23f2-4e93-9262-1b2097fd3f84/plan_maestro_de_pruebas.md)

---

## 6. Configuración de Dirección y Teléfono en Tickets de Clientes

Para permitir una personalización profesional de los tickets sin alterar el diseño de cocina:

1.  **Pantalla de Configuraciones**:
    *   Se transformó la sección "Nombre del Negocio" en **Datos del Establecimiento** dentro de la pestaña *Identidad Visual*.
    *   Se agregaron campos para configurar la **Dirección del Establecimiento** y el **Teléfono de contacto**.
    *   Ahora, al guardar, se actualizan simultáneamente las claves de base de datos `Tickets:CompanyName`, `Tickets:NombreRestaurante`, `Tickets:DireccionRestaurante` y `Tickets:TelefonoRestaurante`.
2.  **Impresión y Previsualización**:
    *   Los tickets del cliente (pre-cuentas y recibos de caja/pago) muestran el nombre, la dirección y el teléfono del negocio en el encabezado.
    *   Las comandas destinadas a cocina y barra omiten estos datos automáticamente para mantener el formato limpio y enfocado únicamente en la preparación de alimentos y bebidas.
