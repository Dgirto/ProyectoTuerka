import { createClient } from '@supabase/supabase-js';
import { VEHICULOS } from './vehiculos.js';

const MP_API = 'https://api.mercadopago.com';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Configuración del servidor. Las claves secretas solo existen aquí, nunca en el navegador. */
export function leerConfig(env = process.env) {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const mpToken = env.MP_ACCESS_TOKEN;
  if (!supabaseUrl || !serviceKey) throw new HttpError(503, 'El servidor no tiene configurado Supabase.');
  if (!mpToken) throw new HttpError(503, 'El servidor no tiene configurado Mercado Pago.');
  return { supabaseUrl, serviceKey, mpToken, monto: Number(env.RESERVA_MONTO) || 300 };
}

export const crearAdmin = (cfg) =>
  createClient(cfg.supabaseUrl, cfg.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function mercadoPago(cfg, path, { method = 'GET', body, fetchImpl = fetch } = {}) {
  const res = await fetchImpl(`${MP_API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${cfg.mpToken}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError(502, `Mercado Pago respondió ${res.status}: ${data.message ?? 'error'}`);
  return data;
}

/**
 * Crea una reserva pendiente y su preferencia de pago en Mercado Pago (Checkout Pro).
 * Devuelve la URL de pago a la que se redirige al cliente.
 */
export async function crearReserva({ token, vehiculoId, origin, cfg, admin, fetchImpl = fetch }) {
  const vehiculo = VEHICULOS[vehiculoId];
  if (!vehiculo) throw new HttpError(400, 'Vehículo no válido.');
  if (!token) throw new HttpError(401, 'Inicia sesión para reservar.');

  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth?.user) throw new HttpError(401, 'Tu sesión expiró. Vuelve a iniciar sesión.');
  const user = auth.user;

  const { data: pagada } = await admin
    .from('reservas')
    .select('id')
    .eq('vehiculo_id', vehiculoId)
    .eq('estado', 'pagada')
    .maybeSingle();
  if (pagada) throw new HttpError(409, 'Este vehículo ya está reservado.');

  const { data: reserva, error } = await admin
    .from('reservas')
    .insert({ user_id: user.id, vehiculo_id: vehiculoId, vehiculo, monto: cfg.monto, moneda: 'PEN' })
    .select('id')
    .single();
  if (error) throw new HttpError(500, 'No se pudo registrar la reserva.');

  const vuelta = `${origin}/reserva/resultado`;
  const preferencia = await mercadoPago(cfg, '/checkout/preferences', {
    method: 'POST',
    fetchImpl,
    body: {
      items: [
        {
          id: vehiculoId,
          title: `Reserva ${vehiculo} · Tuerka`,
          description: 'Separación del vehículo. Se descuenta del precio final.',
          quantity: 1,
          currency_id: 'PEN',
          unit_price: cfg.monto,
        },
      ],
      payer: { email: user.email },
      external_reference: reserva.id,
      back_urls: { success: vuelta, failure: vuelta, pending: vuelta },
      auto_return: 'approved',
      // Mercado Pago no puede avisar a localhost; en local el pago se confirma al volver (confirmarPago).
      ...(origin.startsWith('https://') ? { notification_url: `${origin}/api/mercadopago-webhook` } : {}),
      statement_descriptor: 'TUERKA',
    },
  });

  await admin.from('reservas').update({ mp_preference_id: preferencia.id }).eq('id', reserva.id);
  return { reservaId: reserva.id, url: preferencia.init_point };
}

const ESTADOS_MP = { approved: 'pagada', rejected: 'rechazada', cancelled: 'rechazada' };

/**
 * Consulta el pago directamente a Mercado Pago (nunca se confía en lo que diga el navegador)
 * y actualiza la reserva. Lo usan el webhook y la página de vuelta.
 */
export async function confirmarPago({ paymentId, cfg, admin, fetchImpl = fetch }) {
  if (!/^\d+$/.test(String(paymentId ?? ''))) throw new HttpError(400, 'Pago no válido.');
  const pago = await mercadoPago(cfg, `/v1/payments/${paymentId}`, { fetchImpl });
  const reservaId = pago.external_reference;
  if (!reservaId) throw new HttpError(404, 'El pago no corresponde a una reserva.');

  const { data: reserva } = await admin.from('reservas').select('id, estado, monto').eq('id', reservaId).maybeSingle();
  if (!reserva) throw new HttpError(404, 'Reserva no encontrada.');

  const nuevo = ESTADOS_MP[pago.status];
  if (reserva.estado !== 'pendiente' || !nuevo) return { reservaId, estado: reserva.estado };

  if (nuevo === 'pagada' && (Number(pago.transaction_amount) !== Number(reserva.monto) || pago.currency_id !== 'PEN')) {
    throw new HttpError(409, 'El monto pagado no coincide con la reserva.');
  }

  const cambios = { estado: nuevo, mp_payment_id: String(pago.id) };
  if (nuevo === 'pagada') cambios.pagada_en = new Date().toISOString();
  const { error } = await admin.from('reservas').update(cambios).eq('id', reservaId).eq('estado', 'pendiente');
  // Índice único: si otro cliente pagó primero el mismo vehículo, esta reserva queda rechazada.
  if (error?.code === '23505') {
    await admin.from('reservas').update({ estado: 'rechazada', mp_payment_id: String(pago.id) }).eq('id', reservaId);
    return { reservaId, estado: 'rechazada' };
  }
  if (error) throw new HttpError(500, 'No se pudo actualizar la reserva.');
  return { reservaId, estado: nuevo };
}

/** Respuesta JSON uniforme para las funciones de /api. */
export async function responder(fn) {
  try {
    return Response.json(await fn());
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    if (status >= 500) console.error(e);
    return Response.json({ error: status >= 500 && !(e instanceof HttpError) ? 'Error interno.' : e.message }, { status });
  }
}
