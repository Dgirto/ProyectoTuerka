import { describe, expect, it, vi } from 'vitest';
import { confirmarPago, crearReserva } from './reservas.js';
import { VEHICULOS } from './vehiculos.js';
import { vehicles, vehicleName } from '../../src/data/vehicles.js';

const cfg = { supabaseUrl: 'http://supabase', serviceKey: 'service', mpToken: 'TEST-token', monto: 300 };

/** Cliente de Supabase falso: devuelve respuestas preparadas por tabla y guarda las llamadas. */
function adminFalso({ user = { id: 'u1', email: 'ana@correo.com' }, pagada = null, reserva = null, updateError = null } = {}) {
  const llamadas = [];
  const consulta = (tabla) => {
    const q = { tabla, filtros: {} };
    const api = {
      select: () => api,
      eq: (k, v) => ((q.filtros[k] = v), api),
      maybeSingle: async () => ({ data: q.filtros.estado === 'pagada' ? pagada : reserva }),
      insert: (fila) => (llamadas.push({ insert: fila }), { select: () => ({ single: async () => ({ data: { id: 'res-1' } }) }) }),
      update: (cambios) => {
        llamadas.push({ update: cambios });
        const fin = { eq: () => fin, then: (ok) => ok({ error: cambios.estado === 'pagada' ? updateError : null }) };
        return fin;
      },
    };
    return api;
  };
  return {
    llamadas,
    auth: { getUser: async (t) => (t === 'ok' ? { data: { user } } : { data: { user: null }, error: new Error('jwt') }) },
    from: consulta,
  };
}

const respuesta = (data, ok = true) => Promise.resolve({ ok, status: ok ? 200 : 400, json: async () => data });

describe('catálogo del servidor', () => {
  it('coincide con los vehículos del sitio', () => {
    const delSitio = Object.fromEntries(vehicles.map((v) => [v.id, `${vehicleName(v)} ${v.year}`]));
    expect(VEHICULOS).toEqual(delSitio);
  });
});

describe('crearReserva', () => {
  const base = { token: 'ok', vehiculoId: 'toyota-corolla', origin: 'https://proyecto-tuerka.vercel.app', cfg };

  it('rechaza un vehículo que no existe', async () => {
    await expect(crearReserva({ ...base, vehiculoId: 'tesla', admin: adminFalso() })).rejects.toMatchObject({ status: 400 });
  });

  it('pide iniciar sesión sin token válido', async () => {
    await expect(crearReserva({ ...base, token: '', admin: adminFalso() })).rejects.toMatchObject({ status: 401 });
    await expect(crearReserva({ ...base, token: 'caducado', admin: adminFalso() })).rejects.toMatchObject({ status: 401 });
  });

  it('no permite reservar un vehículo ya pagado', async () => {
    await expect(crearReserva({ ...base, admin: adminFalso({ pagada: { id: 'x' } }) })).rejects.toMatchObject({ status: 409 });
  });

  it('crea la reserva y la preferencia de pago en soles', async () => {
    const admin = adminFalso();
    const fetchImpl = vi.fn(() => respuesta({ id: 'pref-1', init_point: 'https://www.mercadopago.com.pe/checkout?pref=1' }));
    const r = await crearReserva({ ...base, admin, fetchImpl });

    expect(r).toEqual({ reservaId: 'res-1', url: 'https://www.mercadopago.com.pe/checkout?pref=1' });
    expect(admin.llamadas[0].insert).toMatchObject({ user_id: 'u1', vehiculo_id: 'toyota-corolla', monto: 300, moneda: 'PEN' });
    const [url, opts] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.mercadopago.com/checkout/preferences');
    expect(opts.headers.Authorization).toBe('Bearer TEST-token');
    const body = JSON.parse(opts.body);
    expect(body.items[0]).toMatchObject({ currency_id: 'PEN', unit_price: 300, quantity: 1 });
    expect(body.external_reference).toBe('res-1');
    expect(body.notification_url).toBe('https://proyecto-tuerka.vercel.app/api/mercadopago-webhook');
    expect(admin.llamadas[1].update).toEqual({ mp_preference_id: 'pref-1' });
  });

  it('en local no pide webhook (Mercado Pago no llega a localhost)', async () => {
    const fetchImpl = vi.fn(() => respuesta({ id: 'p', init_point: 'u' }));
    await crearReserva({ ...base, origin: 'http://localhost:5174', admin: adminFalso(), fetchImpl });
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).notification_url).toBeUndefined();
  });
});

describe('confirmarPago', () => {
  const pago = (extra) => () => respuesta({ id: 99, external_reference: 'res-1', status: 'approved', transaction_amount: 300, currency_id: 'PEN', ...extra });
  const pendiente = { id: 'res-1', estado: 'pendiente', monto: '300.00' };

  it('marca la reserva como pagada cuando Mercado Pago la aprueba', async () => {
    const admin = adminFalso({ reserva: pendiente });
    const r = await confirmarPago({ paymentId: '99', cfg, admin, fetchImpl: pago() });
    expect(r).toEqual({ reservaId: 'res-1', estado: 'pagada' });
    expect(admin.llamadas[0].update).toMatchObject({ estado: 'pagada', mp_payment_id: '99' });
  });

  it('rechaza un pago con monto distinto', async () => {
    const admin = adminFalso({ reserva: pendiente });
    await expect(confirmarPago({ paymentId: '99', cfg, admin, fetchImpl: pago({ transaction_amount: 1 }) })).rejects.toMatchObject({ status: 409 });
    expect(admin.llamadas).toHaveLength(0);
  });

  it('registra los pagos rechazados', async () => {
    const admin = adminFalso({ reserva: pendiente });
    const r = await confirmarPago({ paymentId: '99', cfg, admin, fetchImpl: pago({ status: 'rejected' }) });
    expect(r.estado).toBe('rechazada');
  });

  it('no cambia una reserva que ya no está pendiente', async () => {
    const admin = adminFalso({ reserva: { ...pendiente, estado: 'pagada' } });
    const r = await confirmarPago({ paymentId: '99', cfg, admin, fetchImpl: pago() });
    expect(r.estado).toBe('pagada');
    expect(admin.llamadas).toHaveLength(0);
  });

  it('si otro cliente pagó primero el mismo vehículo, la reserva queda rechazada', async () => {
    const admin = adminFalso({ reserva: pendiente, updateError: { code: '23505' } });
    const r = await confirmarPago({ paymentId: '99', cfg, admin, fetchImpl: pago() });
    expect(r.estado).toBe('rechazada');
  });

  it('ignora ids de pago no numéricos', async () => {
    await expect(confirmarPago({ paymentId: '1;drop', cfg, admin: adminFalso() })).rejects.toMatchObject({ status: 400 });
  });
});
