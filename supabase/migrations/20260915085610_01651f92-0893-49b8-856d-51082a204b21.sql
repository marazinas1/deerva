ALTER TABLE public.clients
  DROP COLUMN IF EXISTS contact_name,
  DROP COLUMN IF EXISTS contact_email,
  DROP COLUMN IF EXISTS contact_phone,
  DROP COLUMN IF EXISTS website_url;