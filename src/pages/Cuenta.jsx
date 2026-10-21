import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui';
import { ArrowRight } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ESTADOS_COTIZACION, ESTADOS_RESERVA, formatDia, formatFecha, formatSoles } from '../lib/formato';
import './Cuenta.css';

export default function Cuenta() {
  const { user, perfil, isAsesor, signOut } = useAuth();
  const [cotizaciones, setCotizaciones] = useState(null);
  const [reservas, setReservas] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    // Las políticas RLS devuelven solo las filas del usuario (o todas si es asesor; aquí se filtra por él).
    Promise.all([
      supabase.from('cotizaciones').select('*').eq('user_id', user.id).order('creada_en', { ascending: false }),
      supabase.from('reservas').select('*').eq('user_id', user.id).neq('estado', 'pendiente').order('creada_en', { ascending: false }),
    ]).then(([c, r]) => {
      if (!vivo) return;
      if (c.error || r.error) setError('No pudimos cargar tu información. Recarga la página.');
      setCotizaciones(c.data ?? []);
      setReservas(r.data ?? []);
    });
    return () => {
      vivo = false;
    };
  }, [user.id]);

  const nombre = perfil?.nombre?.split(' ')[0] || 'de nuevo';

  return (
    <div className="page container acct">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Mi cuenta' }]} />
      <div className="acct__head">
        <div>
          <p className="eyebrow">Mi cuenta</p>
          <h1 className="display acct__title">Hola, {nombre}.</h1>
          <p className="acct__meta">
            {user.email}
            {perfil?.telefono ? ` · ${perfil.telefono}` : ''}
          </p>
        </div>
        <div className="acct__actions">
          {isAsesor && (
            <Link to="/asesor" className="btn btn--primary">
              Panel de asesor <ArrowRight size={20} />
            </Link>
          )}
          <button type="button" className="btn btn--outline" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {error && (
        <p className="acct__error" role="alert">
          {error}
        </p>
      )}

      <section className="acct__section" aria-labelledby="mis-cotizaciones">
        <div className="acct__section-head">
          <h2 id="mis-cotizaciones" className="display">
            Mis cotizaciones
          </h2>
          <Link to="/contacto#agenda" className="btn btn--outline-yellow">
            Nueva cotización
          </Link>
        </div>
        {cotizaciones === null ? (
          <p className="acct__note">Cargando…</p>
        ) : cotizaciones.length === 0 ? (
          <p className="acct__note">
            Aún no pediste cotizaciones. <Link to="/vehiculos">Explora vehículos</Link> y pide la tuya.
          </p>
        ) : (
          <ul className="acct__list">
            {cotizaciones.map((c) => (
              <li key={c.id} className="acct__item">
                <div className="acct__item-head">
                  <h3>{c.vehiculo}</h3>
                  <Estado tipo={c.estado}>{ESTADOS_COTIZACION[c.estado]}</Estado>
                </div>
                <p className="acct__item-meta">
                  Enviada el {formatFecha(c.creada_en)}
                  {c.fecha_visita ? ` · Visita preferida: ${formatDia(c.fecha_visita)}` : ''}
                </p>
                {c.mensaje && <p className="acct__item-text">{c.mensaje}</p>}
                {c.respuesta && (
                  <div className="acct__reply">
                    <p className="acct__reply-label">Respuesta del asesor</p>
                    <p>{c.respuesta}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="acct__section" aria-labelledby="mis-reservas">
        <div className="acct__section-head">
          <h2 id="mis-reservas" className="display">
            Mis reservas
          </h2>
        </div>
        {reservas === null ? (
          <p className="acct__note">Cargando…</p>
        ) : reservas.length === 0 ? (
          <p className="acct__note">No tienes reservas. Desde la ficha de un vehículo puedes reservarlo con un pago en Mercado Pago.</p>
        ) : (
          <ul className="acct__list">
            {reservas.map((r) => (
              <li key={r.id} className="acct__item">
                <div className="acct__item-head">
                  <h3>
                    <Link to={`/vehiculos/${r.vehiculo_id}`}>{r.vehiculo}</Link>
                  </h3>
                  <Estado tipo={r.estado}>{ESTADOS_RESERVA[r.estado]}</Estado>
                </div>
                <p className="acct__item-meta">
                  {formatSoles(r.monto)} · {formatFecha(r.pagada_en ?? r.creada_en)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function Estado({ tipo, children }) {
  return <span className={`estado estado--${tipo}`}>{children}</span>;
}
