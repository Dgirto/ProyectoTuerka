import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { ArrowRight, CloseIcon, HeartIcon, SearchIcon } from './Icons';
import road from '../assets/road.jpg';
import './MenuOverlay.css';

const COLUMNS = [
  {
    title: 'Explorar',
    links: [
      { to: '/', label: 'Inicio' },
      { to: '/vehiculos', label: 'Vehículos' },
      { to: '/favoritos', label: 'Favoritos' },
      { to: '/comparar', label: 'Comparador' },
    ],
  },
  {
    title: 'Conoce Tuerka',
    links: [
      { to: '/nosotros', label: 'Nosotros' },
      { to: '/nosotros#como-comprar', label: 'Cómo comprar' },
      { to: '/simulador', label: 'Simular cuotas' },
    ],
  },
  {
    title: 'Hablemos',
    links: [
      { to: '/contacto', label: 'Contacto' },
      { to: '/contacto#agenda', label: 'Agendar visita' },
    ],
  },
];

export default function MenuOverlay({ open, onClose, onOpenSearch }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`menu ${open ? 'menu--open' : ''}`} role="dialog" aria-modal="true" aria-label="Menú principal" aria-hidden={!open}>
      <img className="menu__road" src={road} alt="" aria-hidden="true" />

      <div className="menu__top">
        <button type="button" className="menu__close" onClick={onClose} tabIndex={open ? 0 : -1}>
          <CloseIcon size={30} />
          <span>Cerrar</span>
        </button>
        <Logo size={38} />
        <div className="menu__actions">
          <Link to="/favoritos" className="menu__fav" onClick={onClose} tabIndex={open ? 0 : -1}>
            Favoritos <HeartIcon size={22} />
          </Link>
          <span className="header__divider" aria-hidden="true" />
          <button
            type="button"
            className="menu__search"
            aria-label="Buscar vehículos"
            tabIndex={open ? 0 : -1}
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
          >
            <SearchIcon size={26} />
          </button>
        </div>
      </div>

      <nav className="menu__grid">
        {COLUMNS.map((col) => (
          <div className="menu__col" key={col.title}>
            <p className="eyebrow">{col.title}</p>
            <ul>
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} onClick={onClose} tabIndex={open ? 0 : -1}>
                    <span>{l.label}</span>
                    <ArrowRight size={28} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="menu__bottom">
        <p className="menu__claim">
          El siguiente
          <br />
          <span className="text-yellow">Camino</span> es tuyo<span className="text-yellow">.</span>
        </p>
        <div className="menu__legal">
          <Link to="/nosotros" onClick={onClose} tabIndex={open ? 0 : -1}>Privacidad</Link>
          <span>·</span>
          <Link to="/nosotros" onClick={onClose} tabIndex={open ? 0 : -1}>Términos</Link>
        </div>
      </div>
    </div>
  );
}
