import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Traduce los errores de Supabase Auth a mensajes para el usuario.
export function authMessage(error) {
  const msg = error?.message ?? '';
  if (/invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.';
  if (/already registered|already exists/i.test(msg)) return 'Ya existe una cuenta con ese correo. Inicia sesión.';
  if (/email not confirmed/i.test(msg)) return 'Confirma tu correo con el enlace que te enviamos antes de ingresar.';
  if (/password should be at least/i.test(msg)) return 'La contraseña debe tener al menos 8 caracteres.';
  if (/rate limit|too many/i.test(msg)) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  return 'No pudimos completar la operación. Inténtalo de nuevo.';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;

  const loadPerfil = useCallback(async () => {
    if (!supabase || !userId) {
      setPerfil(null);
      return;
    }
    const { data } = await supabase.from('perfiles').select('id, nombre, telefono, rol').eq('id', userId).maybeSingle();
    setPerfil(data);
  }, [userId]);

  useEffect(() => {
    loadPerfil();
  }, [loadPerfil]);

  const signIn = useCallback((email, password) => supabase.auth.signInWithPassword({ email, password }), []);

  const signUp = useCallback(
    ({ email, password, nombre, telefono }) =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre, telefono }, emailRedirectTo: `${window.location.origin}/cuenta` },
      }),
    []
  );

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      perfil,
      isAsesor: perfil?.rol === 'asesor',
      loading,
      signIn,
      signUp,
      signOut,
      reloadPerfil: loadPerfil,
    }),
    [session, perfil, loading, signIn, signUp, signOut, loadPerfil]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
