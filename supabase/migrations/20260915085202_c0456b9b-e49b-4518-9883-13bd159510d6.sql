ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS live_url text,
  ADD COLUMN IF NOT EXISTS lovable_project_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS thumbnail_path text,
  ADD COLUMN IF NOT EXISTS onboarding_fee numeric,
  ADD COLUMN IF NOT EXISTS onboarding_fee_currency text,
  ADD COLUMN IF NOT EXISTS monthly_fee numeric,
  ADD COLUMN IF NOT EXISTS monthly_fee_currency text,
  ADD COLUMN IF NOT EXISTS billing_cycle text;

UPDATE public.clients SET live_url = website_url WHERE live_url IS NULL AND website_url IS NOT NULL;
UPDATE public.clients SET status = 'live' WHERE status = 'active';
UPDATE public.clients SET status = 'paused' WHERE status = 'archived';

CREATE TABLE IF NOT EXISTS public.client_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  email text,
  phone text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_contacts TO authenticated;
GRANT ALL ON public.client_contacts TO service_role;

ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view client contacts" ON public.client_contacts
  FOR SELECT TO authenticated USING (public.is_admin_staff(auth.uid()));
CREATE POLICY "Managers can insert client contacts" ON public.client_contacts
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can update client contacts" ON public.client_contacts
  FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can delete client contacts" ON public.client_contacts
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));

CREATE INDEX IF NOT EXISTS client_contacts_client_id_idx ON public.client_contacts(client_id);

CREATE TRIGGER update_client_contacts_updated_at
  BEFORE UPDATE ON public.client_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.client_contacts (client_id, name, email, phone, is_primary)
SELECT c.id,
       COALESCE(NULLIF(trim(c.contact_name), ''), COALESCE(c.contact_email, 'Contact')),
       c.contact_email,
       c.contact_phone,
       true
FROM public.clients c
WHERE (c.contact_name IS NOT NULL AND trim(c.contact_name) <> '')
   OR (c.contact_email IS NOT NULL AND trim(c.contact_email) <> '')
   OR (c.contact_phone IS NOT NULL AND trim(c.contact_phone) <> '');