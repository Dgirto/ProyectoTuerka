import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Ids de vehículos con reserva pagada. Se consulta una vez y se comparte entre componentes.
let cache = null;
let pending = null;
let version = 0;
const listeners = new Set();

export function refrescarReservados() {
  version += 1;
  cache = null;
  pending = null;
  listeners.forEach((refresh) => refresh());
}

async function cargar() {
  if (!supabase) return new Set();
  const { data, error } = await supabase.rpc('vehiculos_reservados');
  return new Set(error ? [] : data);
}

function cargarReservados() {
  if (!supabase) return Promise.resolve(new Set());
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    const requestVersion = version;
    pending = cargar()
      .then((ids) => {
        if (requestVersion === version) cache = ids;
        return ids;
      })
      .finally(() => {
        if (requestVersion === version) pending = null;
      });
  }
  return pending;
}

export function useReservados() {
  const [ids, setIds] = useState(cache ?? new Set());
  useEffect(() => {
    let vivo = true;
    const refresh = () => {
      const requestVersion = version;
      cargarReservados().then((s) => {
        if (vivo && requestVersion === version) setIds(s);
      });
    };
    listeners.add(refresh);
    refresh();
    return () => {
      vivo = false;
      listeners.delete(refresh);
    };
  }, []);
  return ids;
}
