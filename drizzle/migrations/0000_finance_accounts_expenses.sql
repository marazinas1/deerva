-- Paying customer, one level above a project.
CREATE TABLE public.client_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_accounts TO authenticated;
GRANT ALL ON public.client_accounts TO service_role;

ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view client accounts" ON public.client_accounts
  FOR SELECT TO authenticated USING (public.is_manager(auth.uid()));
CREATE POLICY "Managers can insert client accounts" ON public.client_accounts
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can update client accounts" ON public.client_accounts
  FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can delete client accounts" ON public.client_accounts
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));

CREATE TRIGGER update_client_accounts_updated_at
  BEFORE UPDATE ON public.client_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Projects belong to an account.
ALTER TABLE public.clients ADD COLUMN account_id uuid REFERENCES public.client_accounts(id) ON DELETE SET NULL;
CREATE INDEX idx_clients_account_id ON public.clients(account_id);

-- Contacts move up to the account level; client_id stays as a fallback.
ALTER TABLE public.client_contacts ADD COLUMN account_id uuid REFERENCES public.client_accounts(id) ON DELETE CASCADE;
CREATE INDEX idx_client_contacts_account_id ON public.client_contacts(account_id);

-- Every existing project becomes its own account, keeping today's data intact.
INSERT INTO public.client_accounts (id, name, country, status, created_at)
SELECT c.id, c.name, c.country, 'active', c.created_at FROM public.clients c;

UPDATE public.clients c SET account_id = c.id;
UPDATE public.client_contacts cc SET account_id = cc.client_id WHERE cc.account_id IS NULL;

-- Income rows can say which part of the deal they cover.
ALTER TABLE public.payments ADD COLUMN kind text NOT NULL DEFAULT 'other';

-- Costs: Lovable credits, hosting, contractors. Project optional.
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  spent_on date NOT NULL,
  category text NOT NULL DEFAULT 'other',
  vendor text,
  gross_amount numeric,
  gross_currency text NOT NULL DEFAULT 'EUR',
  fx_rate numeric,
  net_eur numeric NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view expenses" ON public.expenses
  FOR SELECT TO authenticated USING (public.is_manager(auth.uid()));
CREATE POLICY "Managers can insert expenses" ON public.expenses
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can update expenses" ON public.expenses
  FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can delete expenses" ON public.expenses
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));

CREATE INDEX idx_expenses_spent_on ON public.expenses(spent_on DESC);
CREATE INDEX idx_expenses_client_id ON public.expenses(client_id);

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();