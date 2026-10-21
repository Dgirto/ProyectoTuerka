-- Tuerka: perfiles con rol, cotizaciones y reservas de vehículos.
-- Seguridad: Row Level Security en todas las tablas. Un cliente solo ve lo suyo; un asesor ve y gestiona todo.
-- Las reservas solo las crea y confirma el servidor (funciones de Vercel con la clave service_role).

-- ─── Perfiles ────────────────────────────────────────────────────────────────
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  nombre text not null default '' check (char_length(nombre) <= 120),
  telefono text check (char_length(telefono) <= 30),
  rol text not null default 'cliente' check (rol in ('cliente', 'asesor')),
  creado_en timestamptz not null default now()
);

alter table public.perfiles enable row level security;

-- ¿El usuario actual es asesor? (security definer para no depender de las políticas de perfiles)
create function public.es_asesor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'asesor');
$$;

create policy "Cada usuario ve su perfil; el asesor ve todos"
  on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_asesor());

create policy "Cada usuario edita su perfil"
  on public.perfiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- El rol no se puede cambiar desde el navegador: solo nombre y teléfono.
revoke update on public.perfiles from authenticated, anon;
grant update (nombre, telefono) on public.perfiles to authenticated;

-- Crea el perfil al registrarse, con los datos enviados en el registro.
create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, email, nombre, telefono)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(left(new.raw_user_meta_data ->> 'nombre', 120), ''),
    left(new.raw_user_meta_data ->> 'telefono', 30)
  );
  return new;
end;
$$;

create trigger al_registrarse
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ─── Cotizaciones ────────────────────────────────────────────────────────────
create table public.cotizaciones (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  vehiculo_id text check (char_length(vehiculo_id) <= 60),
  vehiculo text not null default 'Sin especificar' check (char_length(vehiculo) <= 120),
  telefono text not null check (char_length(telefono) between 7 and 30),
  fecha_visita date,
  mensaje text check (char_length(mensaje) <= 2000),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'respondida', 'cerrada')),
  respuesta text check (char_length(respuesta) <= 2000),
  respondida_en timestamptz,
  creada_en timestamptz not null default now()
);

create index cotizaciones_user_idx on public.cotizaciones (user_id, creada_en desc);
create index cotizaciones_estado_idx on public.cotizaciones (estado, creada_en desc);

alter table public.cotizaciones enable row level security;

create policy "El cliente ve sus cotizaciones; el asesor ve todas"
  on public.cotizaciones for select to authenticated
  using (user_id = auth.uid() or public.es_asesor());

create policy "El cliente crea cotizaciones a su nombre"
  on public.cotizaciones for insert to authenticated
  with check (user_id = auth.uid() and estado = 'pendiente' and respuesta is null);

create policy "Solo el asesor responde"
  on public.cotizaciones for update to authenticated
  using (public.es_asesor())
  with check (public.es_asesor());

revoke insert, update on public.cotizaciones from authenticated, anon;
grant insert (vehiculo_id, vehiculo, telefono, fecha_visita, mensaje) on public.cotizaciones to authenticated;
grant update (estado, respuesta, respondida_en) on public.cotizaciones to authenticated;

-- ─── Reservas ────────────────────────────────────────────────────────────────
create table public.reservas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.perfiles (id) on delete cascade,
  vehiculo_id text not null check (char_length(vehiculo_id) <= 60),
  vehiculo text not null,
  monto numeric(10, 2) not null check (monto > 0),
  moneda text not null default 'PEN',
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagada', 'rechazada', 'cancelada')),
  mp_preference_id text,
  mp_payment_id text,
  creada_en timestamptz not null default now(),
  pagada_en timestamptz
);

create index reservas_user_idx on public.reservas (user_id, creada_en desc);
-- Un vehículo solo puede tener una reserva pagada.
create unique index reservas_una_pagada_por_vehiculo on public.reservas (vehiculo_id) where estado = 'pagada';

alter table public.reservas enable row level security;

create policy "El cliente ve sus reservas; el asesor ve todas"
  on public.reservas for select to authenticated
  using (user_id = auth.uid() or public.es_asesor());

create policy "Solo el asesor cancela reservas"
  on public.reservas for update to authenticated
  using (public.es_asesor())
  with check (public.es_asesor() and estado = 'cancelada');

-- Altas y pagos solo desde el servidor (service_role ignora RLS); el asesor solo puede cancelar.
revoke insert, update, delete on public.reservas from authenticated, anon;
grant update (estado) on public.reservas to authenticated;

-- Vehículos con reserva pagada, visibles para todos (solo el id, sin datos personales).
create function public.vehiculos_reservados()
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select vehiculo_id from public.reservas where estado = 'pagada';
$$;

grant execute on function public.vehiculos_reservados() to anon, authenticated;
