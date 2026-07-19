# 🕯️ Guía de Configuración - Web de Velas Artesanales

Esta página web ha sido diseñada con un estilo minimalista premium (inspirado en la estética limpia de Apple) para el emprendimiento de velas aromáticas de Montserrat.

A continuación encontrarás las instrucciones sencillas para personalizar el nombre, cambiar el número de WhatsApp para recibir los pedidos y conectar el catálogo a Google Sheets o Excel para gestionarlo sin tocar el código.

---

## 🛠️ 1. Personalizar el Nombre del Emprendimiento

Actualmente el sitio utiliza el nombre temporal **"AURA"**. Cuando Montserrat defina el nombre final de su negocio, puedes cambiarlo siguiendo estos pasos:

1. Abre el archivo [index.html](file:///c:/Users/ervin/OneDrive/Escritorio/python/velas-artesanales/index.html).
2. Busca la línea `<title>AURA | Velas Aromáticas Artesanales</title>` y edita el título para tu pestaña.
3. Busca el texto `A U R A` (en el menú de navegación y en el pie de página) y reemplázalo por el nombre del emprendimiento.
4. Si el nombre es largo, puedes ajustar el espaciado entre letras en el archivo [style.css](file:///c:/Users/ervin/OneDrive/Escritorio/python/velas-artesanales/style.css) modificando la propiedad `letter-spacing` dentro de la regla `.logo`.

---

## 💬 2. Configurar el WhatsApp para Recibir Pedidos

Cuando los clientes finalizan su compra, la página genera automáticamente un mensaje estructurado con el resumen de la compra y abre el chat del negocio para acordar el pago y el envío.

Para cambiar el número de recepción:
1. Abre el archivo [app.js](file:///c:/Users/ervin/OneDrive/Escritorio/python/velas-artesanales/app.js).
2. Localiza la variable en la línea 8:
   ```javascript
   const WHATSAPP_NUMBER = "521234567890";
   ```
3. Reemplaza el número `"521234567890"` por el número de celular de Montserrat. 
   * **Importante**: Debe incluir el código del país (ej. `52` para México, `54` para Argentina, `57` para Colombia), seguido del número de teléfono completo, **sin espacios, guiones ni el símbolo +**. Por ejemplo: `5215512345678`.

---

## 📊 3. Conectar el Catálogo a Google Sheets (Base de Datos)

Para que Montserrat pueda subir, borrar o cambiar el precio de sus velas usando una hoja de cálculo desde su celular o computadora, sigue estos pasos:

### Paso A: Crear la Hoja de Cálculo
1. Entra a [Google Sheets (Hojas de cálculo de Google)](https://sheets.google.com) y crea una hoja en blanco.
2. En la primera fila (fila 1), escribe **exactamente** los siguientes encabezados en minúsculas (uno por columna):
   * Columna A: `id` (un número único, ej: 1, 2, 3...)
   * Columna B: `nombre` (el título de la vela, ej: *Bruma de Vainilla*)
   * Columna C: `descripcion` (una breve descripción de las notas aromáticas)
   * Columna D: `precio` (solo números, ej: *280*)
   * Columna E: `categoria` (ej: *Relajante*, *Cálido*, *Herbal*, *Frutal*, *Fresco* - úsalas para los filtros)
   * Columna F: `imagen` (un enlace directo a la foto de la vela. Puedes subirlas a un servidor gratuito o usar enlaces directos de Unsplash o Imgur)
   * Columna G: `detalles` (ej: *Envase de cerámica | 250g | 45 horas*)

3. Llena las siguientes filas con la información de las velas que desees vender.

### Paso B: Publicar la Hoja como CSV
1. En Google Sheets, haz clic en **Archivo** (File) > **Compartir** (Share) > **Publicar en la web** (Publish to the web).
2. En la ventana que aparece:
   * Cambia "Todo el documento" por la pestaña donde están tus velas (usualmente *Hoja 1*).
   * Cambia "Página web" por **Valores separados por comas (.csv)**.
3. Haz clic en **Publicar** y confirma.
4. Copia el enlace largo que te proporciona Google Sheets.

### Paso C: Vincular el Enlace en el Código
1. Abre [app.js](file:///c:/Users/ervin/OneDrive/Escritorio/python/velas-artesanales/app.js).
2. Localiza la variable en la línea 12:
   ```javascript
   const GOOGLE_SHEET_CSV_URL = "";
   ```
3. Pega el enlace de Google Sheets que copiaste entre las comillas. Debería verse algo así:
   ```javascript
   const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?gid=0&single=true&output=csv";
   ```
4. Guarda los cambios. ¡Listo! Al actualizar la página web, los productos se cargarán directamente desde la hoja de Google Sheets.

> [!NOTE]
> Si la variable `GOOGLE_SHEET_CSV_URL` se deja vacía (`""`), el sitio web usará por defecto el archivo local [products.json](file:///c:/Users/ervin/OneDrive/Escritorio/python/velas-artesanales/products.json) como base de datos de respaldo.

---

## 📂 4. Estructura de Archivos del Proyecto

El proyecto está organizado de la siguiente manera:
- **`index.html`**: Estructura principal y maquetado semántico del sitio.
- **`style.css`**: Estilos de diseño, paleta de colores, tipografías y efectos visuales.
- **`app.js`**: Lógica de interacción del carrito de compras, conexión de datos y animaciones.
- **`products.json`**: Base de datos de velas locales de respaldo.
- **`assets/`**: Carpeta que contiene las imágenes principales de la web.
  - **`assets/candle.jpg`**: Imagen premium generada de la vela física sobre la cual se monta la llama interactiva.
