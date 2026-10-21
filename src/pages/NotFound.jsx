import { Link } from 'react-router-dom';
import { ArrowRight } from '../components/Icons';

export default function NotFound() {
  return (
    <div className="page container" style={{ padding: '96px var(--gutter)', textAlign: 'center' }}>
      <p className="eyebrow">Error 404</p>
      <h1 className="display" style={{ fontSize: 'clamp(56px, 7vw, 120px)', margin: '16px 0' }}>
        Este camino <span className="text-yellow">no existe.</span>
      </h1>
      <p className="lead" style={{ marginBottom: 32 }}>
        La página que buscas no está disponible o fue movida.
      </p>
      <Link to="/vehiculos" className="btn btn--primary">
        Ver vehículos <ArrowRight size={20} />
      </Link>
    </div>
  );
}
