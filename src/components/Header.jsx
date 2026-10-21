import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons';
import { useAuth } from '../context/AuthContext';
import { backendReady } from '../lib/supabase';
import { useFavorites } from '../context/FavoritesContext';
import './Header.css';

export default function Header({ onOpenMenu, onOpenSearch }) {
  const { ids } = useFavorites();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const overlay = pathname === '/';

  return (
    <header className={`header ${overlay ? 'header--overlay' : ''}`}>
      <div className="header__inner">
        <button type="button" className="header__menu" onClick={onOpenMenu} aria-label="Abrir menú">
          <MenuIcon size={28} />
          <span>Menú</span>
        </button>

        <div className="header__logo">
          <Logo size={38} />
        </div>

        <div className="header__actions">
          {backendReady && (
            <>
              <Link to={user ? '/cuenta' : '/ingresar'} className="header__fav header__account" aria-label={user ? 'Mi cuenta' : 'Ingresar'}>
                <span className="header__fav-label">{user ? 'Mi cuenta' : 'Ingresar'}</span>
                <span className="header__fav-icon">
                  <UserIcon size={22} />
                </span>
              </Link>
              <span className="header__divider" aria-hidden="true" />
            </>
          )}
          <Link to="/favoritos" className="header__fav" aria-label={`Favoritos (${ids.length})`}>
            <span className="header__fav-label">Favoritos</span>
            <span className="header__fav-icon">
              <HeartIcon size={22} filled={pathname === '/favoritos'} />
              {ids.length > 0 && <span className="header__badge">{ids.length}</span>}
            </span>
          </Link>
          <span className="header__divider" aria-hidden="true" />
          <button type="button" className="header__search" onClick={onOpenSearch} aria-label="Buscar vehículos">
            <SearchIcon size={26} />
          </button>
        </div>
      </div>
    </header>
  );
}
