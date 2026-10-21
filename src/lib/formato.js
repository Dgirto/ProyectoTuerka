export const ESTADOS_COTIZACION = {
  pendiente: 'Pendiente',
  respondida: 'Respondida',
  cerrada: 'Cerrada',
};

export const ESTADOS_RESERVA = {
  pendiente: 'Pago pendiente',
  pagada: 'Reservado',
  rechazada: 'Pago rechazado',
  cancelada: 'Cancelada',
};

export const formatFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const formatFechaHora = (iso) =>
  iso ? new Date(iso).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

// Fechas sin hora (columna date): se fija el mediodía para que la zona horaria no cambie el día.
export const formatDia = (ymd) =>
  ymd ? new Date(`${ymd}T12:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export const formatSoles = (n) =>
  `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Monto de la reserva que se muestra en el sitio (el servidor usa RESERVA_MONTO, por defecto el mismo valor).
export const MONTO_RESERVA = Number(import.meta.env.VITE_RESERVA_MONTO) || 300;
