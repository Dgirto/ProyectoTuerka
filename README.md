# Tuerka

Sitio web de Tuerka (venta de vehículos) construido con React 18, React Router y Vite, a partir del diseño de Figma. Incluye cuentas de usuario, cotizaciones con panel de asesor y reserva de vehículos con Mercado Pago, sobre Supabase y funciones de Vercel.

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
| `/vehiculos/:id` | Detalle: galería, ficha, pestañas, favoritos, reserva con Mercado Pago y vehículos relacionados |
| `/comparar` | Comparador de hasta tres vehículos; selección de sesión y enlace compartible `?ids=id1,id2` |
| `/simulador` | Simulador orientativo con inicial, plazo y TEA; recibe `?vehiculo=id` desde la ficha |
| `/ayuda` | Preguntas frecuentes con búsqueda y filtros por tema |
| `/favoritos` | Vehículos guardados (se conservan en el navegador con `localStorage`) |
| `/contacto` | Formulario "Agenda tu visita": con sesión iniciada, guarda la cotización y avisa por correo |
| `/ingresar` | Ingreso y registro |
| `/cuenta` | Mis cotizaciones (con la respuesta del asesor) y mis reservas |
| `/asesor` | Panel de asesor: responder cotizaciones y ver o cancelar reservas (solo rol `asesor`) |
| `/reserva/resultado` | Vuelta de Mercado Pago: confirma el pago y muestra el resultado |
| `/nosotros` | Quiénes somos y "Cómo comprar" (`/nosotros#como-comprar`) |

El menú a pantalla completa y el buscador (ícono de lupa) están disponibles en todas las páginas.

## Dónde cambiar cosas

- **Inventario:** `src/data/vehicles.js` (marcas, precios, fotos, descripciones).
- **Logo:** `src/components/Logo.jsx` ("TUERK" + la "A" con la pata amarilla, en SVG).
- **Colores y tipografías:** variables al inicio de `src/index.css`.

## Backend

| Pieza | Qué hace |
| --- | --- |
| **Supabase** | Base de datos PostgreSQL y autenticación (correo y contraseña). Esquema en `supabase/migrations/`. |
| **Row Level Security** | Cada cliente solo ve sus cotizaciones y reservas; solo un asesor responde o cancela; nadie puede darse el rol de asesor ni marcar un pago desde el navegador. |
| **`api/reservas.js`** | Función de Vercel: valida la sesión, crea la reserva pendiente y la preferencia de pago de Mercado Pago (Checkout Pro). |
| **`api/mercadopago-webhook.js`** y **`api/confirmar-pago.js`** | Consultan el pago directamente a Mercado Pago y marcan la reserva como pagada o rechazada. Nunca se confía en lo que diga el navegador. |
| **EmailJS** | Aviso por correo de cada cotización (plantilla con el logo en `public/email/logo-tuerka.png`). |

Un vehículo solo puede tener una reserva pagada (índice único): si dos clientes pagan a la vez, el segundo pago queda rechazado.
Sin las variables de Supabase el sitio sigue funcionando como antes, sin cuentas ni reservas.

### Puesta en marcha

1. **Supabase:** crea un proyecto y, en **SQL Editor**, ejecuta `supabase/migrations/20261021000000_tuerka.sql`.
   En **Authentication → URL Configuration** pon como *Site URL* `https://proyecto-tuerka.vercel.app`.
2. **Mercado Pago:** en [Tus integraciones](https://www.mercadopago.com.pe/developers/panel/app) crea una aplicación (Checkout Pro) y copia el *Access Token* de las **credenciales de prueba**.
3. **Variables:** copia `.env.example` como `.env` para trabajar en local y añade las mismas en Vercel (**Settings → Environment Variables**). `SUPABASE_SERVICE_ROLE_KEY` y `MP_ACCESS_TOKEN` son secretas: solo en el servidor, nunca con prefijo `VITE_`.
4. **Asesores:** crea la cuenta desde el sitio y luego, en el SQL Editor de Supabase:

   ```sql
   update public.perfiles set rol = 'asesor' where email = 'correo-del-asesor@ejemplo.com';
   ```
5. **EmailJS (opcional):** plantilla con `{{nombre}}`, `{{telefono}}`, `{{correo}}`, `{{vehiculo}}`, `{{fecha}}`, `{{mensaje}}` y `{{time}}`. En **Account → Security** permite solo el dominio del sitio.

Para probar un pago usa las [tarjetas de prueba de Mercado Pago](https://www.mercadopago.com.pe/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards) (titular `APRO` para aprobado, `OTHE` para rechazado).

### Desarrollo local

Con Docker en marcha, `npx supabase start` levanta Supabase en local y aplica el esquema. Copia la URL y las claves que muestra `npx supabase status` en `.env.local`. `npm run dev` sirve también las funciones de `/api`.

```bash
npm test                          # lógica de reservas y pagos (Mercado Pago simulado)
node supabase/pruebas-rls.mjs     # 19 comprobaciones de seguridad contra el Supabase local
```

`.env` y `.env.local` no se suben al repositorio.

## Mejoras de exploración y accesibilidad

- La búsqueda admite palabras sin tildes y combina varios términos.
- Los rangos de presupuesto incluyen sus límites sin solaparse: hasta 20 000; más de 20 000 y hasta 30 000; más de 30 000 dólares.
- El catálogo valida mínimo y máximo, muestra cada filtro aplicado y permite volver a la selección anterior con el botón Atrás.
- Los favoritos empiezan vacíos; se validan los IDs recuperados y se sincronizan entre pestañas del mismo navegador.
- El comparador conserva hasta tres IDs en `sessionStorage`; las URLs compartidas descartan IDs desconocidos, repetidos y selecciones que excedan el límite.
- El simulador usa cuotas constantes y convierte TEA a tasa efectiva mensual: `(1 + TEA/100) ** (1/12) - 1`. No incluye seguros ni comisiones. Admite tasa cero e inicial del 100%.
- Menú, búsqueda y filtros móviles contienen el foco, cierran con Escape, bloquean el fondo y devuelven el foco al cerrar. Las pestañas de la ficha admiten flechas, Inicio y Fin.

### Verificar los cambios

`npm test` comprueba filtros, límites de precio, cuotas, selecciones persistidas, navegación y comportamiento de teclado, además de las pruebas existentes de reservas con servicios simulados. `npm run build` valida la compilación de producción.

Las comprobaciones de interfaz usan un DOM local con datos de demostración; no envían correos ni realizan pagos. Las pruebas de RLS requieren Supabase local y se ejecutan por separado con el comando documentado arriba.
