import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { vehicles } from '../data/vehicles';
import { readVehicleIds, validVehicleIds } from '../lib/seleccion';
const CompareContext = createContext(null);
const allowed = vehicles.map((v) => v.id);
export const COMPARE_LIMIT = 3;
export function CompareProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try { return readVehicleIds(sessionStorage, 'tuerka:compare', allowed, COMPARE_LIMIT); } catch { return []; }
  });
  useEffect(() => {
    try { sessionStorage.setItem('tuerka:compare', JSON.stringify(ids)); } catch { /* Sesión sin almacenamiento */ }
  }, [ids]);
  const replace = useCallback((next) => setIds(validVehicleIds(next, allowed, COMPARE_LIMIT)), []);
  const toggle = useCallback((id) => setIds((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : validVehicleIds([...prev, id], allowed, COMPARE_LIMIT)), []);
  const value = useMemo(() => ({ ids, replace, toggle }), [ids, replace, toggle]);
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
export function useCompare() { return useContext(CompareContext); }
