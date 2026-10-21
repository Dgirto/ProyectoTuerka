import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Ids de vehículos con reserva pagada. Se consulta una vez y se comparte entre componentes.
let cache = null;
let pending = null;

export function refrescarReservados() {
  cache = null;
  pending = null;
}

async function cargar() {
  if (!supabase) return new Set();
  const { data, error } = await supabase.rpc('vehiculos_reservados');
  return new Set(error ? [] : data);
}

export function useReservados() {
  const [ids, setIds] = useState(cache ?? new Set());
  useEffect(() => {
    if (cache) return undefined;
    let vivo = true;
    pending ??= cargar().then((s) => (cache = s));
    pending.then((s) => vivo && setIds(s));
    return () => {
      vivo = false;
    };
  }, []);
  return ids;
}
