ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS next_payment_on date,
  ADD COLUMN IF NOT EXISTS last_paid_on date,
  ADD COLUMN IF NOT EXISTS thumbnail_source text,
  ADD COLUMN IF NOT EXISTS thumbnail_captured_at timestamptz,
  ADD COLUMN IF NOT EXISTS favicon_url text;