-- Royal Luxury Watches — Supabase schema
-- Run this in the Supabase SQL editor before anything else.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Product catalog (mirrors data/products.json; useful once you
-- want to edit stock/pricing from Supabase instead of the JSON file)
-- ─────────────────────────────────────────────────────────────
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists products (
  id text primary key,                -- matches slug from data/products.json
  brand text not null,
  name text not null,
  slug text not null unique,
  model text,
  description text,
  price numeric(10, 2) not null,
  currency text not null default 'USD',
  spec jsonb not null default '{}',
  images text[] not null default '{}',
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_brand on products (brand);

-- ─────────────────────────────────────────────────────────────
-- Orders
-- ─────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address text not null,
  shipping_city text,
  shipping_country text,
  currency text not null default 'USD',
  subtotal numeric(10, 2) not null,
  status text not null default 'pending', -- pending | paid | cancelled | fulfilled
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id text not null,
  product_name text not null,
  brand text,
  unit_price numeric(10, 2) not null,
  quantity integer not null default 1
);

create index if not exists idx_order_items_order on order_items (order_id);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- Products: readable by anyone (public catalog).
-- Orders: never readable/writable by the anon key directly —
-- all order writes go through the service-role key in the
-- /api/checkout and /api/webhook route handlers.
-- ─────────────────────────────────────────────────────────────
alter table products enable row level security;
alter table brands enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Public read access to products"
  on products for select
  using (true);

create policy "Public read access to brands"
  on brands for select
  using (true);

-- No policies are created for orders / order_items for the anon
-- role — they are intentionally locked down. All access happens
-- server-side via the service role key, which bypasses RLS.
