-- contact_emails
CREATE TABLE public.contact_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.client_contacts(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_emails TO authenticated;
GRANT ALL ON public.contact_emails TO service_role;
ALTER TABLE public.contact_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can view contact emails" ON public.contact_emails FOR SELECT TO authenticated USING (public.is_manager(auth.uid()));
CREATE POLICY "Managers can insert contact emails" ON public.contact_emails FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can update contact emails" ON public.contact_emails FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can delete contact emails" ON public.contact_emails FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));
CREATE INDEX contact_emails_contact_id_idx ON public.contact_emails (contact_id);
CREATE UNIQUE INDEX contact_emails_one_primary_idx ON public.contact_emails (contact_id) WHERE is_primary;
CREATE TRIGGER update_contact_emails_updated_at BEFORE UPDATE ON public.contact_emails FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- contact_phones
CREATE TABLE public.contact_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.client_contacts(id) ON DELETE CASCADE,
  phone text NOT NULL,
  label text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_phones TO authenticated;
GRANT ALL ON public.contact_phones TO service_role;
ALTER TABLE public.contact_phones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can view contact phones" ON public.contact_phones FOR SELECT TO authenticated USING (public.is_manager(auth.uid()));
CREATE POLICY "Managers can insert contact phones" ON public.contact_phones FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can update contact phones" ON public.contact_phones FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can delete contact phones" ON public.contact_phones FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));
CREATE INDEX contact_phones_contact_id_idx ON public.contact_phones (contact_id);
CREATE UNIQUE INDEX contact_phones_one_primary_idx ON public.contact_phones (contact_id) WHERE is_primary;
CREATE TRIGGER update_contact_phones_updated_at BEFORE UPDATE ON public.contact_phones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- payment_methods
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'bank_transfer',
  is_active boolean NOT NULL DEFAULT true,
  account_holder text,
  account_number text,
  bank_name text,
  swift text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can view payment methods" ON public.payment_methods FOR SELECT TO authenticated USING (public.is_manager(auth.uid()));
CREATE POLICY "Managers can insert payment methods" ON public.payment_methods FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can update payment methods" ON public.payment_methods FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can delete payment methods" ON public.payment_methods FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  contact_id uuid REFERENCES public.client_contacts(id) ON DELETE SET NULL,
  paid_on date NOT NULL,
  services text[] NOT NULL DEFAULT '{}',
  payment_type text,
  invoice_no text,
  gross_amount numeric(12,2),
  gross_currency text NOT NULL DEFAULT 'EUR',
  fx_rate numeric(12,6),
  net_eur numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can view payments" ON public.payments FOR SELECT TO authenticated USING (public.is_manager(auth.uid()));
CREATE POLICY "Managers can insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can update payments" ON public.payments FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can delete payments" ON public.payments FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));
CREATE INDEX payments_client_id_idx ON public.payments (client_id);
CREATE INDEX payments_paid_on_idx ON public.payments (paid_on DESC);
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Carry the existing single email / phone over as the primary entries.
INSERT INTO public.contact_emails (contact_id, email, is_primary)
SELECT id, btrim(email), true FROM public.client_contacts
WHERE email IS NOT NULL AND btrim(email) <> '';

INSERT INTO public.contact_phones (contact_id, phone, is_primary)
SELECT id, btrim(phone), true FROM public.client_contacts
WHERE phone IS NOT NULL AND btrim(phone) <> '';