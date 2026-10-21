import { Link } from 'react-router-dom';
import './Logo.css';

// Logotipo TUERKA: "TUERK" + una "A" formada por un trazo blanco y una pata amarilla.
export default function Logo({ size = 40, to = '/', className = '' }) {
  const mark = (
    <span className={`logo ${className}`} style={{ fontSize: size }} aria-label="Tuerka">
      <span className="logo__text" aria-hidden="true">TUERK</span>
      <svg className="logo__a" viewBox="0 0 112 122" aria-hidden="true">
        <polygon points="0,122 33,122 78,0 45,0" fill="currentColor" />
        <polygon points="63,34 73,8 112,122 79,122" fill="var(--yellow)" />
      </svg>
    </span>
  );
  return to ? (
    <Link to={to} className="logo-link" aria-label="Tuerka, ir al inicio">
      {mark}
    </Link>
  ) : (
    mark
  );
}
