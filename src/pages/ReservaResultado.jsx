import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckIcon, CloseIcon, InfoIcon } from '../components/Icons';
import { supabase } from '../lib/supabase';
import { refrescarReservados } from '../hooks/useReservados';
import { formatSoles } from '../lib/formato';
import './Cuenta.css';

// Mercado Pago vuelve aquí con ?payment_id=…&external_reference=<id de la reserva>.
// El estado se confirma en el servidor consultando el pago; el webhook hace lo mismo en producción.
export default function ReservaResultado() {
  const [params] = useSearchParams();
  const reservaId = params.get('external_reference');
  const paymentId = params.get('payment_id');
  const [reserva, setReserva] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reservaId) return undefined;
    let vivo = true;
    let intentos = 0;

    const leer = async () => {
      const { data } = await supabase.from('reservas').select('*').eq('id', reservaId).maybeSingle();
      if (!vivo) return;
      if (!data) return setError('No encontramos esta reserva en tu cuenta.');
      setReserva(data);
      if (data.estado === 'pagada') refrescarReservados();
      // Mientras siga pendiente, se vuelve a consultar unos segundos (el pago puede tardar en acreditarse).
      if (data.estado === 'pendiente' && intentos++ < 10) setTimeout(leer, 3000);
    };

    const confirmar = paymentId && paymentId !== 'null'
      ? fetch('/api/confirmar-pago', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        }).catch(() => null)
      : Promise.resolve();
    confirmar.then(leer);

    return () => {
      vivo = false;
    };
  }, [reservaId, paymentId]);

  if (!reservaId) return <Resultado tipo="error" titulo="Sin datos de pago" texto="No recibimos información de Mercado Pago." />;
  if (error) return <Resultado tipo="error" titulo="Reserva no encontrada" texto={error} />;
  if (!reserva) return <Resultado tipo="info" titulo="Confirmando tu pago…" texto="Un momento, estamos consultando a Mercado Pago." />;

  if (reserva.estado === 'pagada') {
    return (
      <Resultado
        tipo="ok"
        titulo="¡Vehículo reservado!"
        texto={`Pagaste ${formatSoles(reserva.monto)} y el ${reserva.vehiculo} quedó reservado a tu nombre. Un asesor te contactará para coordinar la visita y el resto de la compra.`}
      />
    );
  }
  if (reserva.estado === 'pendiente') {
    return (
      <Resultado
        tipo="info"
        titulo="Pago en proceso"
        texto="Mercado Pago aún no confirma el pago. Te avisaremos en tu cuenta en cuanto se acredite."
      />
    );
  }
  return (
    <Resultado
      tipo="error"
      titulo="El pago no se completó"
      texto={`No se cobró la reserva del ${reserva.vehiculo}. Puedes intentarlo de nuevo con otro medio de pago.`}
      reintentar={`/vehiculos/${reserva.vehiculo_id}`}
    />
  );
}

const ICONOS = { ok: CheckIcon, error: CloseIcon, info: InfoIcon };

function Resultado({ tipo, titulo, texto, reintentar }) {
  const Icono = ICONOS[tipo];
  return (
    <div className="page container acct acct--center">
      <span className={`acct__result-icon acct__result-icon--${tipo}`}>
        <Icono size={44} />
      </span>
      <h1 className="display acct__title">{titulo}</h1>
      <p className="lead acct__result-text" role={tipo === 'error' ? 'alert' : 'status'}>
        {texto}
      </p>
      <div className="acct__actions">
        {reintentar && (
          <Link to={reintentar} className="btn btn--primary">
            Intentar de nuevo <ArrowRight size={20} />
          </Link>
        )}
        <Link to="/cuenta" className={`btn ${reintentar ? 'btn--outline' : 'btn--primary'}`}>
          Ir a mi cuenta
        </Link>
      </div>
    </div>
  );
}
