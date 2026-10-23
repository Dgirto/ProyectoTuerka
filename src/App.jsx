import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MenuOverlay from './components/MenuOverlay';
import SearchOverlay from './components/SearchOverlay';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import VehicleDetail from './pages/VehicleDetail';
import Favorites from './pages/Favorites';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Ingresar from './pages/Ingresar';
import Cuenta from './pages/Cuenta';
import Asesor from './pages/Asesor';
import ReservaResultado from './pages/ReservaResultado';
import Help from './pages/Help';
import Financing from './pages/Financing';
import Compare from './pages/Compare';
import CompareTray from './components/CompareTools';
import RequireAuth from './components/RequireAuth';

const TITLES = {
  '/': 'Tu próximo camino empieza aquí',
  '/vehiculos': 'Vehículos',
  '/ayuda': 'Preguntas frecuentes',
  '/simulador': 'Simulador de cuotas',
  '/comparar': 'Comparador',
  '/favoritos': 'Favoritos',
  '/contacto': 'Contacto',
  '/nosotros': 'Nosotros',
  '/ingresar': 'Ingresar',
  '/cuenta': 'Mi cuenta',
  '/asesor': 'Panel de asesor',
  '/reserva/resultado': 'Reserva',
};

// Lleva al inicio de la página (o al ancla #id) en cada cambio de ruta.
function useScrollOnNavigate() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    return undefined;
  }, [pathname, hash]);

  useEffect(() => {
    const title = TITLES[pathname];
    if (title) document.title = `Tuerka · ${title}`;
  }, [pathname]);
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useScrollOnNavigate();

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? 'hidden' : '';
  }, [menuOpen, searchOpen]);

  return (
    <>
      <a href="#contenido" className="sr-only">
        Saltar al contenido
      </a>
      <Header onOpenMenu={() => setMenuOpen(true)} onOpenSearch={openSearch} />
      <MenuOverlay open={menuOpen} onClose={closeMenu} onOpenSearch={openSearch} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />

      <main id="contenido">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehiculos" element={<Catalog />} />
          <Route path="/vehiculos/:id" element={<VehicleDetail />} />
          <Route path="/ayuda" element={<Help />} />
          <Route path="/simulador" element={<Financing />} />
          <Route path="/comparar" element={<Compare />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/ingresar" element={<Ingresar />} />
          <Route path="/cuenta" element={<RequireAuth><Cuenta /></RequireAuth>} />
          <Route path="/asesor" element={<RequireAuth asesor><Asesor /></RequireAuth>} />
          <Route path="/reserva/resultado" element={<RequireAuth><ReservaResultado /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <CompareTray />
    </>
  );
}
