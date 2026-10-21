import { confirmarPago, crearAdmin, leerConfig, responder } from './_lib/reservas.js';

// POST /api/mercadopago-webhook — notificación de Mercado Pago cuando cambia un pago.
// No se confía en el contenido de la notificación: confirmarPago vuelve a consultar el pago a Mercado Pago.
export function POST(request) {
  return responder(async () => {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const tipo = body.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic');
    const paymentId = body.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id');
    if (tipo !== 'payment' || !paymentId) return { ignorado: true };
    const cfg = leerConfig();
    return confirmarPago({ paymentId, cfg, admin: crearAdmin(cfg) });
  });
}
