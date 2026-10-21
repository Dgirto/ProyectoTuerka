import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { backendReady } from '../lib/supabase';

// Protege una página: pide iniciar sesión (y, si se indica, el rol de asesor).
export default function RequireAuth({ asesor = false, children }) {
  const { user, perfil, loading } = useAuth();
  const { pathname, search } = useLocation();

  if (!backendReady) return <Aviso titulo="Cuentas no disponibles" texto="Esta versión del sitio no tiene las cuentas de usuario configuradas." />;
  if (loading || (user && !perfil)) return <Aviso titulo="Cargando…" />;
  if (!user) return <Navigate to={`/ingresar?volver=${encodeURIComponent(pathname + search)}`} replace />;
  if (asesor && perfil.rol !== 'asesor') {
    return <Aviso titulo="Acceso solo para asesores" texto="Tu cuenta no tiene permiso para ver esta página." />;
  }
  return children;
}

function Aviso({ titulo, texto }) {
  return (
    <div className="page container acct acct--center">
      <h1 className="display acct__title">{titulo}</h1>
      {texto && <p className="lead">{texto}</p>}
      {texto && (
        <Link to="/" className="btn btn--primary">
          Volver al inicio
        </Link>
      )}
    </div>
  );
}
