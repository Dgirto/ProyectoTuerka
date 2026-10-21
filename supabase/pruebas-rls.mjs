// Prueba las políticas de seguridad (RLS) contra el Supabase local.
// Uso: npx supabase start && npx supabase db reset && node supabase/pruebas-rls.mjs
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  execSync('npx supabase status -o env', { encoding: 'utf8' })
    .split('\n')
    .map((l) => l.match(/^([A-Z_]+)="(.*)"$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]])
);
const URL = env.API_URL;
const nuevo = () => createClient(URL, env.ANON_KEY, { auth: { persistSession: false } });
const admin = createClient(URL, env.SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let fallos = 0;
const ok = (cond, texto) => {
  console.log(`${cond ? '✓' : '✗'} ${texto}`);
  if (!cond) fallos++;
};

async function usuario(nombre) {
  const c = nuevo();
  const email = `${nombre}.${Date.now()}@prueba.local`;
  const { data, error } = await c.auth.signUp({ email, password: 'clave-segura-123', options: { data: { nombre: `${nombre} Prueba`, telefono: '987654321' } } });
  if (error) throw error;
  return { c, id: data.user.id, email };
}

const ana = await usuario('ana');
const beto = await usuario('beto');
const asesor = await usuario('asesor');
await admin.from('perfiles').update({ rol: 'asesor' }).eq('id', asesor.id);
const anonimo = nuevo();

// Perfiles
const { data: perfilAna } = await ana.c.from('perfiles').select('*').eq('id', ana.id).single();
ok(perfilAna?.nombre === 'ana Prueba' && perfilAna.rol === 'cliente' && perfilAna.email === ana.email, 'El registro crea el perfil con nombre, correo y rol cliente');
await ana.c.from('perfiles').update({ rol: 'asesor' }).eq('id', ana.id);
const { data: rolAna } = await admin.from('perfiles').select('rol').eq('id', ana.id).single();
ok(rolAna.rol === 'cliente', 'Un cliente no puede hacerse asesor');
const { data: perfilesVistos } = await ana.c.from('perfiles').select('id');
ok(perfilesVistos.length === 1, 'Un cliente solo ve su propio perfil');

// Cotizaciones
const ins = await ana.c.from('cotizaciones').insert({ vehiculo_id: 'toyota-corolla', vehiculo: 'Toyota Corolla 2024', telefono: '987654321', mensaje: 'Hola' }).select().single();
ok(!ins.error && ins.data.user_id === ana.id && ins.data.estado === 'pendiente', 'Un cliente crea una cotización a su nombre');
const trampa = await ana.c.from('cotizaciones').insert({ telefono: '987654321', estado: 'respondida', respuesta: 'Aprobado' });
ok(Boolean(trampa.error), 'Un cliente no puede crear una cotización ya respondida');
const ajena = await ana.c.from('cotizaciones').insert({ user_id: beto.id, telefono: '987654321' });
ok(Boolean(ajena.error), 'Un cliente no puede crear cotizaciones a nombre de otro');
const { data: vistasBeto } = await beto.c.from('cotizaciones').select('id');
ok(vistasBeto.length === 0, 'Un cliente no ve las cotizaciones de otro');
const { data: vistasAnon } = await anonimo.from('cotizaciones').select('id');
ok((vistasAnon ?? []).length === 0, 'Un visitante sin cuenta no ve cotizaciones');
await ana.c.from('cotizaciones').update({ estado: 'cerrada', respuesta: 'yo misma' }).eq('id', ins.data.id);
const { data: trasIntento } = await admin.from('cotizaciones').select('estado').eq('id', ins.data.id).single();
ok(trasIntento.estado === 'pendiente', 'Un cliente no puede responder su propia cotización');

const { data: vistasAsesor } = await asesor.c.from('cotizaciones').select('*, perfiles(nombre, email)');
ok(vistasAsesor.length === 1 && vistasAsesor[0].perfiles?.email === ana.email, 'El asesor ve todas las cotizaciones con el nombre y correo del cliente');
const resp = await asesor.c.from('cotizaciones').update({ estado: 'respondida', respuesta: 'Tenemos disponibilidad el sábado.' }).eq('id', ins.data.id).select().single();
ok(!resp.error && resp.data.estado === 'respondida', 'El asesor responde una cotización');
const { data: vistaAna } = await ana.c.from('cotizaciones').select('respuesta').eq('id', ins.data.id).single();
ok(vistaAna.respuesta === 'Tenemos disponibilidad el sábado.', 'El cliente ve la respuesta del asesor');

// Reservas
const resCliente = await ana.c.from('reservas').insert({ user_id: ana.id, vehiculo_id: 'mazda-3', vehiculo: 'Mazda 3 2024', monto: 300, estado: 'pagada' });
ok(Boolean(resCliente.error), 'Un cliente no puede crear ni marcar reservas como pagadas');
const r1 = await admin.from('reservas').insert({ user_id: ana.id, vehiculo_id: 'mazda-3', vehiculo: 'Mazda 3 2024', monto: 300 }).select().single();
const r2 = await admin.from('reservas').insert({ user_id: beto.id, vehiculo_id: 'mazda-3', vehiculo: 'Mazda 3 2024', monto: 300 }).select().single();
await admin.from('reservas').update({ estado: 'pagada' }).eq('id', r1.data.id);
const doble = await admin.from('reservas').update({ estado: 'pagada' }).eq('id', r2.data.id);
ok(doble.error?.code === '23505', 'Un vehículo no puede tener dos reservas pagadas');
const { data: reservadosAnon } = await anonimo.rpc('vehiculos_reservados');
ok(JSON.stringify(reservadosAnon) === '["mazda-3"]', 'Cualquier visitante ve qué vehículos están reservados (solo el id)');
const { data: reservasBeto } = await beto.c.from('reservas').select('id, estado');
ok(reservasBeto.length === 1 && reservasBeto[0].estado === 'pendiente', 'Cada cliente ve solo sus reservas');
await ana.c.from('reservas').update({ estado: 'cancelada' }).eq('id', r1.data.id);
const { data: r1tras } = await admin.from('reservas').select('estado').eq('id', r1.data.id).single();
ok(r1tras.estado === 'pagada', 'Un cliente no puede cancelar reservas');
const cancel = await asesor.c.from('reservas').update({ estado: 'cancelada' }).eq('id', r1.data.id).select().single();
ok(!cancel.error && cancel.data.estado === 'cancelada', 'El asesor puede cancelar una reserva');
const reabrir = await asesor.c.from('reservas').update({ estado: 'pagada' }).eq('id', r1.data.id);
ok(Boolean(reabrir.error), 'El asesor no puede marcar una reserva como pagada (solo el pago lo hace)');

console.log(fallos ? `\n${fallos} comprobaciones fallaron` : '\nTodas las comprobaciones pasaron');
process.exit(fallos ? 1 : 0);
