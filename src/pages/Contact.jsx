import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui';
import { ArrowRight, CalendarCheckIcon, ChatIcon, CheckIcon } from '../components/Icons';
import { getVehicle, vehicleName } from '../data/vehicles';
import interior from '../assets/interior.jpg';
import './Contact.css';

const STORAGE_KEY = 'tuerka:solicitudes';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

const today = () => new Date().toISOString().slice(0, 10);

function initialForm(params) {
  const v = getVehicle(params.get('vehiculo'));
  const name = v ? `${vehicleName(v)} ${v.year}` : '';
  return {
    nombre: '',
    telefono: '',
    correo: '',
    vehiculo: name,
    fecha: '',
    mensaje: v && params.get('motivo') === 'info' ? `Hola, quisiera recibir más información sobre el ${name}.` : '',
    privacidad: false,
  };
}

function validate(f) {
  const e = {};
  if (f.nombre.trim().length < 3) e.nombre = 'Ingresa tu nombre completo.';
  if (!PHONE_RE.test(f.telefono.trim())) e.telefono = 'Ingresa un número de teléfono válido.';
  if (!EMAIL_RE.test(f.correo.trim())) e.correo = 'Ingresa un correo electrónico válido.';
  if (f.fecha && f.fecha < today()) e.fecha = 'Elige una fecha a partir de hoy.';
  if (!f.privacidad) e.privacidad = 'Debes aceptar la política de privacidad.';
  return e;
}

export default function Contact() {
  const [params] = useSearchParams();
  const [form, setForm] = useState(() => initialForm(params));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setStatus('sending');
    // Sin backend: la solicitud se guarda localmente para simular el envío.
    setTimeout(() => {
      try {
        const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, { ...form, enviado: new Date().toISOString() }]));
      } catch {
        /* almacenamiento no disponible */
      }
      setStatus('sent');
    }, 700);
  };

  const reset = () => {
    setForm(initialForm(new URLSearchParams()));
    setStatus('idle');
  };

  const field = (key, label, input, required = false) => (
    <div className={`cfield ${errors[key] ? 'has-error' : ''}`}>
      <label htmlFor={`f-${key}`}>
        {label} {required && <span className="cfield__req">*</span>}
      </label>
      {input}
      {errors[key] && (
        <p className="cfield__error" id={`e-${key}`} role="alert">
          {errors[key]}
        </p>
      )}
    </div>
  );

  const aria = (key) => ({
    id: `f-${key}`,
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `e-${key}` : undefined,
  });

  return (
    <div className="page contact container">
      <div className="contact__intro">
        <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Contacto' }]} />
        <h1 className="display contact__title">
          Hablemos de tu
          <br />
          <span className="text-yellow">próximo auto.</span>
        </h1>
        <p className="lead">Déjanos tus datos y coordinemos una visita.</p>

        <div className="contact__cards">
          <div className="contact__card">
            <ChatIcon size={48} className="text-yellow" />
            <div>
              <h2>Consulta por un vehículo</h2>
              <p>Resolvemos tus dudas y te asesoramos.</p>
            </div>
          </div>
          <div className="contact__card">
            <CalendarCheckIcon size={48} className="text-yellow" />
            <div>
              <h2>Agenda una visita</h2>
              <p>Conoce el vehículo en persona.</p>
            </div>
          </div>
        </div>

        <img className="contact__img" src={interior} alt="Interior de un vehículo con volante y pantalla central" />
      </div>

      <section className="contact__form-wrap" id="agenda" aria-labelledby="agenda-title">
        {status === 'sent' ? (
          <div className="contact__success" role="status">
            <span className="contact__success-icon">
              <CheckIcon size={40} />
            </span>
            <h2>¡Solicitud enviada!</h2>
            <p>
              Gracias, {form.nombre.split(' ')[0]}. Un asesor de Tuerka te contactará pronto al {form.telefono} o a {form.correo}
              {form.fecha ? ` para confirmar tu visita del ${new Date(`${form.fecha}T12:00`).toLocaleDateString('es', { day: 'numeric', month: 'long' })}` : ''}.
            </p>
            <div className="contact__success-actions">
              <Link to="/vehiculos" className="btn btn--primary">
                Seguir explorando <ArrowRight size={20} />
              </Link>
              <button type="button" className="btn btn--outline-dark" onClick={reset}>
                Enviar otra solicitud
              </button>
            </div>
          </div>
        ) : (
          <form className="cform" onSubmit={submit} noValidate>
            <div className="cform__head">
              <h2 id="agenda-title" className="display">Agenda tu visita</h2>
              <p>Los campos con * son obligatorios.</p>
            </div>

            <div className="cform__row">
              {field('nombre', 'Nombre completo', <input {...aria('nombre')} type="text" autoComplete="name" placeholder="Tu nombre completo" value={form.nombre} onChange={set('nombre')} />, true)}
              {field('telefono', 'Teléfono', <input {...aria('telefono')} type="tel" autoComplete="tel" placeholder="Tu número de teléfono" value={form.telefono} onChange={set('telefono')} />, true)}
            </div>
            {field('correo', 'Correo electrónico', <input {...aria('correo')} type="email" autoComplete="email" placeholder="tu@correo.com" value={form.correo} onChange={set('correo')} />, true)}
            <div className="cform__row">
              {field('vehiculo', 'Vehículo de interés', <input {...aria('vehiculo')} type="text" placeholder="Ej. SUV, pickup, sedán, marca o modelo" value={form.vehiculo} onChange={set('vehiculo')} />)}
              {field('fecha', 'Fecha preferida', <input {...aria('fecha')} type="date" min={today()} value={form.fecha} onChange={set('fecha')} />)}
            </div>
            {field('mensaje', 'Mensaje', <textarea {...aria('mensaje')} rows={4} placeholder="Cuéntanos qué te interesa o cualquier consulta adicional…" value={form.mensaje} onChange={set('mensaje')} />)}

            <div className={`cform__check ${errors.privacidad ? 'has-error' : ''}`}>
              <input id="f-privacidad" type="checkbox" checked={form.privacidad} onChange={set('privacidad')} aria-invalid={Boolean(errors.privacidad)} />
              <label htmlFor="f-privacidad">
                Acepto la <Link to="/nosotros">política de privacidad.</Link>
              </label>
            </div>
            {errors.privacidad && (
              <p className="cfield__error" role="alert">
                {errors.privacidad}
              </p>
            )}

            <button type="submit" className="btn btn--primary btn--block cform__submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'} <ArrowRight size={24} />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
