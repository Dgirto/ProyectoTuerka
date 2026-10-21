import { crearAdmin, crearReserva, leerConfig, responder } from './_lib/reservas.js';

// POST /api/reservas  { vehiculoId }  (Authorization: Bearer <token de sesión de Supabase>)
export function POST(request) {
  return responder(async () => {
    const cfg = leerConfig();
    const { vehiculoId } = await request.json().catch(() => ({}));
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const origin = new URL(request.url).origin;
    return crearReserva({ token, vehiculoId, origin, cfg, admin: crearAdmin(cfg) });
  });
}
