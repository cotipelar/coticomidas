-- ========================================================
-- SCHEMA SQL PARA COTICOMIDAS EN SUPABASE
-- Copiar y pegar este contenido en el 'SQL Editor' de Supabase
-- y presionar 'RUN'.
-- ========================================================

-- 1. Tabla de Insumos / Ingredientes
create table if not exists public.ingredients (
  id text primary key,
  name text not null,
  category text not null,
  purchase_price numeric not null default 0,
  purchase_quantity numeric not null default 1,
  purchase_unit text not null,
  cost_per_base_unit numeric not null default 0,
  base_unit text not null,
  notes text,
  updated_at timestamptz default now()
);

-- 2. Tabla de Recetas / Comidas
create table if not exists public.recipes (
  id text primary key,
  name text not null,
  category text not null,
  description text,
  yield_count numeric not null default 1,
  yield_unit text not null,
  sale_price numeric not null default 0,
  ingredients jsonb not null default '[]'::jsonb,
  packaging jsonb not null default '[]'::jsonb,
  notes text,
  updated_at timestamptz default now()
);

-- 3. Tabla de Pedidos
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text,
  created_at timestamptz default now(),
  delivery_date text,
  status text not null default 'pendiente',
  items jsonb not null default '[]'::jsonb,
  notes text,
  updated_at timestamptz default now()
);

-- Habilitar Row Level Security (RLS) pero permitir acceso público anon para la app
alter table public.ingredients enable row level security;
alter table public.recipes enable row level security;
alter table public.orders enable row level security;

-- Políticas de lectura y escritura públicas (anon)
create policy "Acceso completo a ingredientes" on public.ingredients for all using (true) with check (true);
create policy "Acceso completo a recetas" on public.recipes for all using (true) with check (true);
create policy "Acceso completo a pedidos" on public.orders for all using (true) with check (true);

-- Habilitar Realtime para que los cambios se transmitan en vivo a todos los celulares
alter publication supabase_realtime add table public.ingredients;
alter publication supabase_realtime add table public.recipes;
alter publication supabase_realtime add table public.orders;
