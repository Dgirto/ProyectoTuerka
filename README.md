# Tuerka

Sitio web de Tuerka (venta de vehículos) construido con React 18, React Router y Vite, a partir del diseño de Figma.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre http://localhost:5173. Para generar la versión de producción usa `npm run build` (sale en `dist/`) y `npm run preview` para probarla.

En Vercel, `vercel.json` redirige todas las rutas a `index.html` para que React Router resuelva las páginas internas (por ejemplo `/vehiculos`) al abrirlas directamente o al recargar.

## Páginas

| Ruta | Página |
| --- | --- |
| `/` | Inicio: portada, buscador por tipo, marca y presupuesto, categorías y destacados |
| `/vehiculos` | Catálogo con filtros, orden y búsqueda (los filtros viven en la URL) |
| `/vehiculos/:id` | Detalle: galería, ficha, pestañas, favoritos y vehículos relacionados |
| `/favoritos` | Vehículos guardados (se conservan en el navegador con `localStorage`) |
| `/contacto` | Formulario "Agenda tu visita" con validación |
| `/nosotros` | Quiénes somos y "Cómo comprar" (`/nosotros#como-comprar`) |

El menú a pantalla completa y el buscador (ícono de lupa) están disponibles en todas las páginas.

## Dónde cambiar cosas

- **Inventario:** `src/data/vehicles.js` (marcas, precios, fotos, descripciones).
- **Logo:** `src/components/Logo.jsx` ("TUERK" + la "A" con la pata amarilla, en SVG).
- **Colores y tipografías:** variables al inicio de `src/index.css`.

## Formulario de contacto (EmailJS)

El formulario «Agenda tu visita» de `/contacto` envía la solicitud por correo con [EmailJS](https://www.emailjs.com). La plantilla de EmailJS usa las variables `{{nombre}}`, `{{telefono}}`, `{{correo}}`, `{{vehiculo}}`, `{{fecha}}`, `{{mensaje}}` y `{{time}}`; los campos opcionales vacíos llegan como «Sin especificar».

1. Copia `.env.example` como `.env` y completa `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` y `VITE_EMAILJS_PUBLIC_KEY`. Reinicia `npm run dev`.
2. En Vercel, añade las mismas variables en **Settings → Environment Variables** y vuelve a desplegar.
3. En EmailJS, **Account → Security**, permite solo el dominio del sitio.

`.env` no se sube al repositorio. Si faltan las variables, la solicitud solo se guarda en el navegador (`localStorage`, clave `tuerka:solicitudes`). El logo para los correos está en `public/email/logo-tuerka.png`, porque los clientes de correo no muestran SVG.
