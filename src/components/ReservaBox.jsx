import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon } from './Icons';
import { useAuth } from '../context/AuthContext';
import { useReservados } from '../hooks/useReservados';
import { backendReady } from '../lib/supabase';
import { formatSoles, MONTO_RESERVA } from '../lib/formato';
import './ReservaBox.css';

// Reserva del vehículo con un pago de separación en Mercado Pago (Checkout Pro).
export default function ReservaBox({ vehicle }) {
  const { session } = useAuth();
  const reservados = useReservados();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('idle'); // idle | creando | error
  const [error, setError] = useState('');

  if (!backendReady) return null;

  if (reservados.has(vehicle.id)) {
    return (
      <div className="reserva reserva--tomada" role="status">
        <CheckIcon size={22} /> Este vehículo ya está reservado.
      </div>
    );
  }

  const reservar = async () => {
    if (!session) {
      navigate(`/ingresar?volver=${encodeURIComponent(`/vehiculos/${vehicle.id}`)}`);
      return;
    }
    setEstado('creando');
    setError('');
    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ vehiculoId: vehicle.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo iniciar el pago.');
      window.location.assign(data.url);
    } catch (e) {
      setError(e.message);
      setEstado('error');
    }
  };

  return (
    <div className="reserva">
      <button type="button" className="btn btn--outline-yellow btn--block reserva__btn" onClick={reservar} disabled={estado === 'creando'}>
        {estado === 'creando' ? 'Abriendo Mercado Pago…' : `Reservar por ${formatSoles(MONTO_RESERVA)}`}
      </button>
      <p className="reserva__note">Pago seguro con Mercado Pago. Se descuenta del precio final.</p>
      {error && (
        <p className="reserva__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
