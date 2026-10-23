import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { vehicles } from '../data/vehicles';
import { readVehicleIds } from '../lib/seleccion';
const allowed = vehicles.map((v) => v.id);
const STORAGE_KEY = 'tuerka:favorites';
const FavoritesContext = createContext(null);

function readStored() {
  try {
    return readVehicleIds(localStorage, STORAGE_KEY, allowed);
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [ids]);

  useEffect(() => {
    const sync = (e) => { if (e.key === STORAGE_KEY || e.key === null) setIds(readStored()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const toggle = useCallback(
    (id) => allowed.includes(id) && setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    []
  );
  const remove = useCallback((id) => setIds((prev) => prev.filter((x) => x !== id)), []);

  const value = useMemo(
    () => ({ ids, toggle, remove, isFavorite: (id) => ids.includes(id) }),
    [ids, toggle, remove]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  return ctx;
}
