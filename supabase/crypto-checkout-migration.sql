-- Run once in the Supabase SQL editor for an existing HEYWATCHES database.
-- The checkout remains backwards-compatible before this is applied, but these
-- columns make crypto payment reconciliation explicit in the orders table.

alter table orders add column if not exists payment_asset text;
alter table orders add column if not exists payment_network text;
alter table orders add column if not exists payment_wallet_address text;
alter table orders add column if not exists transaction_hash text;
alter table orders add column if not exists payment_submitted_at timestamptz;

create unique index if not exists idx_orders_transaction_hash
  on orders (transaction_hash)
  where transaction_hash is not null;
