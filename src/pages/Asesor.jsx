import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs, Select } from '../components/ui';
import { supabase } from '../lib/supabase';
import { refrescarReservados } from '../hooks/useReservados';
import { ESTADOS_COTIZACION, ESTADOS_RESERVA, formatDia, formatFechaHora, formatSoles } from '../lib/formato';
import { Estado } from './Cuenta';
import './Cuenta.css';

const FILTROS = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'respondida', label: 'Respondidas' },
  { value: 'cerrada', label: 'Cerradas' },
  { value: 'todas', label: 'Todas' },
];

export default function Asesor() {
  const [vista, setVista] = useState('cotizaciones');
  const [filtro, setFiltro] = useState('pendiente');
  const [cotizaciones, setCotizaciones] = useState(null);
  const [reservas, setReservas] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    let q = supabase.from('cotizaciones').select('*, perfiles(nombre, email)').order('creada_en', { ascending: false });
    if (filtro !== 'todas') q = q.eq('estado', filtro);
    const [c, r] = await Promise.all([
      q,
      supabase.from('reservas').select('*, perfiles(nombre, email, telefono)').neq('estado', 'pendiente').order('creada_en', { ascending: false }),
    ]);
    setError(c.error || r.error ? 'No se pudieron cargar los datos.' : '');
    setCotizaciones(c.data ?? []);
    setReservas(r.data ?? []);
  }, [filtro]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const pendientes = vista === 'cotizaciones' && filtro === 'pendiente' ? cotizaciones?.length : null;

  return (
    <div className="page container acct">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Mi cuenta', to: '/cuenta' }, { label: 'Panel de asesor' }]} />
      <div className="acct__head">
        <div>
          <p className="eyebrow">Panel de asesor</p>
          <h1 className="display acct__title">Solicitudes</h1>
          {pendientes != null && <p className="acct__meta">{pendientes === 1 ? '1 cotización pendiente' : `${pendientes} cotizaciones pendientes`}</p>}
        </div>
      </div>

      <div className="acct__tabs acct__tabs--wide" role="tablist" aria-label="Vista">
        <button type="button" role="tab" aria-selected={vista === 'cotizaciones'} onClick={() => setVista('cotizaciones')}>
          Cotizaciones
        </button>
        <button type="button" role="tab" aria-selected={vista === 'reservas'} onClick={() => setVista('reservas')}>
          Reservas
        </button>
      </div>

      {error && (
        <p className="acct__error" role="alert">
          {error}
        </p>
      )}

      {vista === 'cotizaciones' ? (
        <section className="acct__section" aria-label="Cotizaciones">
          <div className="acct__section-head">
            <Select label="Filtrar por estado" value={filtro} onChange={setFiltro} options={FILTROS} className="acct__filter" />
          </div>
          {cotizaciones === null ? (
            <p className="acct__note">Cargando…</p>
          ) : cotizaciones.length === 0 ? (
            <p className="acct__note">No hay cotizaciones en este estado.</p>
          ) : (
            <ul className="acct__list">
              {cotizaciones.map((c) => (
                <Cotizacion key={c.id} c={c} onGuardada={cargar} />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="acct__section" aria-label="Reservas">
          {reservas === null ? (
            <p className="acct__note">Cargando…</p>
          ) : reservas.length === 0 ? (
            <p className="acct__note">Aún no hay reservas pagadas.</p>
          ) : (
            <ul className="acct__list">
              {reservas.map((r) => (
                <Reserva key={r.id} r={r} onCambio={cargar} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function Cotizacion({ c, onGuardada }) {
  const [respuesta, setRespuesta] = useState(c.respuesta ?? '');
  const [estado, setEstado] = useState(c.estado === 'pendiente' ? 'respondida' : c.estado);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const guardar = async (e) => {
    e.preventDefault();
    if (estado === 'respondida' && respuesta.trim().length < 5) return setError('Escribe una respuesta para el cliente.');
    setGuardando(true);
    const { error: err } = await supabase
      .from('cotizaciones')
      .update({ estado, respuesta: respuesta.trim() || null, respondida_en: new Date().toISOString() })
      .eq('id', c.id);
    setGuardando(false);
    if (err) return setError('No se pudo guardar. Inténtalo de nuevo.');
    setError('');
    onGuardada();
  };

  const correo = c.perfiles?.email;
  return (
    <li className="acct__item">
      <div className="acct__item-head">
        <h3>{c.vehiculo}</h3>
        <Estado tipo={c.estado}>{ESTADOS_COTIZACION[c.estado]}</Estado>
      </div>
      <p className="acct__item-meta">
        {c.perfiles?.nombre || 'Cliente'} · <a href={`tel:${c.telefono}`}>{c.telefono}</a>
        {correo && (
          <>
            {' · '}
            <a href={`mailto:${correo}`}>{correo}</a>
          </>
        )}
      </p>
      <p className="acct__item-meta">
        Recibida el {formatFechaHora(c.creada_en)}
        {c.fecha_visita ? ` · Visita preferida: ${formatDia(c.fecha_visita)}` : ''}
        {c.vehiculo_id && (
          <>
            {' · '}
            <Link to={`/vehiculos/${c.vehiculo_id}`}>Ver vehículo</Link>
          </>
        )}
      </p>
      {c.mensaje && <p className="acct__item-text">{c.mensaje}</p>}

      <form className="acct__answer" onSubmit={guardar}>
        <label htmlFor={`r-${c.id}`}>Respuesta para el cliente</label>
        <textarea id={`r-${c.id}`} className="field-input" rows={3} value={respuesta} onChange={(e) => setRespuesta(e.target.value)} maxLength={2000} />
        <div className="acct__answer-row">
          <Select
            label="Nuevo estado"
            value={estado}
            onChange={setEstado}
            options={Object.entries(ESTADOS_COTIZACION).map(([value, label]) => ({ value, label }))}
          />
          <button type="submit" className="btn btn--primary" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
        {error && (
          <p className="acct__error" role="alert">
            {error}
          </p>
        )}
      </form>
    </li>
  );
}

function Reserva({ r, onCambio }) {
  const [cancelando, setCancelando] = useState(false);

  const cancelar = async () => {
    if (!window.confirm(`¿Cancelar la reserva de ${r.vehiculo}? El vehículo volverá a estar disponible. El reembolso se gestiona en Mercado Pago.`)) return;
    setCancelando(true);
    await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', r.id);
    refrescarReservados();
    setCancelando(false);
    onCambio();
  };

  return (
    <li className="acct__item">
      <div className="acct__item-head">
        <h3>
          <Link to={`/vehiculos/${r.vehiculo_id}`}>{r.vehiculo}</Link>
        </h3>
        <Estado tipo={r.estado}>{ESTADOS_RESERVA[r.estado]}</Estado>
      </div>
      <p className="acct__item-meta">
        {r.perfiles?.nombre || 'Cliente'} · {r.perfiles?.email}
        {r.perfiles?.telefono ? ` · ${r.perfiles.telefono}` : ''}
      </p>
      <p className="acct__item-meta">
        {formatSoles(r.monto)} · {formatFechaHora(r.pagada_en ?? r.creada_en)}
        {r.mp_payment_id ? ` · Pago Mercado Pago n.º ${r.mp_payment_id}` : ''}
      </p>
      {r.estado === 'pagada' && (
        <button type="button" className="btn btn--outline acct__small-btn" onClick={cancelar} disabled={cancelando}>
          {cancelando ? 'Cancelando…' : 'Cancelar reserva'}
        </button>
      )}
    </li>
  );
}
