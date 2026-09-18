ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS iban text,
  ADD COLUMN IF NOT EXISTS routing_number text,
  ADD COLUMN IF NOT EXISTS account_type text,
  ADD COLUMN IF NOT EXISTS bank_address text,
  ADD COLUMN IF NOT EXISTS intermediary_bank text,
  ADD COLUMN IF NOT EXISTS beneficiary_address text,
  ADD COLUMN IF NOT EXISTS transfer_instructions text;