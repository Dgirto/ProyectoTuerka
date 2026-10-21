import { createClient } from '@supabase/supabase-js';

// URL y clave pública (anon) del proyecto de Supabase. Son públicas: la seguridad está en las políticas RLS.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sin configuración, el sitio sigue funcionando sin cuentas, cotizaciones guardadas ni reservas.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const backendReady = Boolean(supabase);
