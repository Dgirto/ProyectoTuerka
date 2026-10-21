import { confirmarPago, crearAdmin, leerConfig, responder } from './_lib/reservas.js';

// POST /api/confirmar-pago  { paymentId }
// La página de vuelta de Mercado Pago lo llama para no depender solo del webhook (que no llega a localhost).
export function POST(request) {
  return responder(async () => {
    const cfg = leerConfig();
    const { paymentId } = await request.json().catch(() => ({}));
    return confirmarPago({ paymentId, cfg, admin: crearAdmin(cfg) });
  });
}
