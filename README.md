# Tuerka

Sitio web de Tuerka (venta de vehículos) construido con React 18, React Router y Vite, a partir del diseño de Figma.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre http://localhost:5173. Para generar la versión de producción usa `npm run build` (sale en `dist/`) y `npm run preview` para probarla.

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

## Pendiente para producción

El formulario de contacto todavía no envía datos a ningún servidor. Las solicitudes solo se guardan en el navegador (`localStorage`, clave `tuerka:solicitudes`). Para recibirlas de verdad, conecta `submit` en `src/pages/Contact.jsx` a tu API o a un servicio de formularios.
