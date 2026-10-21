import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui';
import { ArrowRight, CalendarCheckIcon, ChatIcon, CheckIcon } from '../components/Icons';
import { authMessage, useAuth } from '../context/AuthContext';
import { backendReady } from '../lib/supabase';
import './Cuenta.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

// Solo rutas internas: evita redirigir a otro sitio con ?volver=https://…
const destinoSeguro = (v) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/cuenta');

export default function Ingresar() {
  const [params] = useSearchParams();
  const volver = destinoSeguro(params.get('volver'));
  const [modo, setModo] = useState(params.get('modo') === 'registro' ? 'registro' : 'ingreso');
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to={volver} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const registro = modo === 'registro';

  const validar = () => {
    if (registro && form.nombre.trim().length < 3) return 'Ingresa tu nombre completo.';
    if (registro && !PHONE_RE.test(form.telefono.trim())) return 'Ingresa un número de teléfono válido.';
    if (!EMAIL_RE.test(form.email.trim())) return 'Ingresa un correo electrónico válido.';
    if (form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setAviso('');
    const problema = validar();
    setError(problema);
    if (problema) return;
    setEnviando(true);
    const email = form.email.trim().toLowerCase();
    const { data, error: err } = registro
      ? await signUp({ email, password: form.password, nombre: form.nombre.trim(), telefono: form.telefono.trim() })
      : await signIn(email, form.password);
    setEnviando(false);
    if (err) return setError(authMessage(err));
    if (registro && !data.session) {
      setAviso('¡Cuenta creada! Te enviamos un correo para confirmarla. Ábrelo y vuelve para iniciar sesión.');
      setModo('ingreso');
      return;
    }
    navigate(volver, { replace: true });
  };

  const cambiar = (m) => {
    setModo(m);
    setError('');
    setAviso('');
  };

  return (
    <div className="page container acct acct--split">
      <div className="acct__intro">
        <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: registro ? 'Crear cuenta' : 'Ingresar' }]} />
        <h1 className="display acct__title">
          Tu cuenta
          <br />
          <span className="text-yellow">Tuerka.</span>
        </h1>
        <ul className="acct__benefits">
          <li>
            <ChatIcon size={30} className="text-yellow" /> Pide cotizaciones y recibe la respuesta de un asesor.
          </li>
          <li>
            <CalendarCheckIcon size={30} className="text-yellow" /> Reserva un vehículo con un pago seguro en Mercado Pago.
          </li>
          <li>
            <CheckIcon size={30} className="text-yellow" /> Sigue el estado de tus solicitudes en un solo lugar.
          </li>
        </ul>
      </div>

      <section className="acct__panel" aria-labelledby="acct-form-title">
        {!backendReady ? (
          <p className="acct__note">Las cuentas no están disponibles en esta versión del sitio.</p>
        ) : (
          <>
            <div className="acct__tabs" role="tablist" aria-label="Acceso">
              <button type="button" role="tab" aria-selected={!registro} onClick={() => cambiar('ingreso')}>
                Ingresar
              </button>
              <button type="button" role="tab" aria-selected={registro} onClick={() => cambiar('registro')}>
                Crear cuenta
              </button>
            </div>

            <form className="acct__form" onSubmit={submit} noValidate>
              <h2 id="acct-form-title" className="sr-only">
                {registro ? 'Crear cuenta' : 'Ingresar'}
              </h2>
              {registro && (
                <>
                  <Campo id="a-nombre" label="Nombre completo">
                    <input id="a-nombre" className="field-input" autoComplete="name" value={form.nombre} onChange={set('nombre')} />
                  </Campo>
                  <Campo id="a-telefono" label="Teléfono">
                    <input id="a-telefono" className="field-input" type="tel" autoComplete="tel" value={form.telefono} onChange={set('telefono')} />
                  </Campo>
                </>
              )}
              <Campo id="a-email" label="Correo electrónico">
                <input id="a-email" className="field-input" type="email" autoComplete="email" value={form.email} onChange={set('email')} />
              </Campo>
              <Campo id="a-password" label="Contraseña" hint={registro ? 'Mínimo 8 caracteres.' : undefined}>
                <input
                  id="a-password"
                  className="field-input"
                  type="password"
                  autoComplete={registro ? 'new-password' : 'current-password'}
                  value={form.password}
                  onChange={set('password')}
                />
              </Campo>

              {error && (
                <p className="acct__error" role="alert">
                  {error}
                </p>
              )}
              {aviso && (
                <p className="acct__ok" role="status">
                  {aviso}
                </p>
              )}

              <button type="submit" className="btn btn--primary btn--block" disabled={enviando}>
                {enviando ? 'Un momento…' : registro ? 'Crear cuenta' : 'Ingresar'} <ArrowRight size={22} />
              </button>
            </form>

            <p className="acct__switch">
              {registro ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
              <button type="button" onClick={() => cambiar(registro ? 'ingreso' : 'registro')}>
                {registro ? 'Ingresa' : 'Créala gratis'}
              </button>
            </p>
            <p className="acct__legal">
              Al crear una cuenta aceptas la <Link to="/nosotros">política de privacidad</Link>.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

export function Campo({ id, label, hint, children }) {
  return (
    <div className="afield">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="afield__hint">{hint}</p>}
    </div>
  );
}
