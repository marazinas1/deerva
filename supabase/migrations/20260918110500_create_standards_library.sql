CREATE TABLE public.standard_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_kind text NOT NULL,
  target_slug text NOT NULL,
  title text NOT NULL,
  reason text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  base_revision text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT standard_drafts_target_kind_check CHECK (target_kind IN ('standard', 'skill', 'document')),
  CONSTRAINT standard_drafts_status_check CHECK (status IN ('draft', 'ready', 'implemented', 'archived'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.standard_drafts TO authenticated;
GRANT ALL ON public.standard_drafts TO service_role;

ALTER TABLE public.standard_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view standard drafts" ON public.standard_drafts
  FOR SELECT TO authenticated USING (public.is_admin_staff(auth.uid()));
CREATE POLICY "Managers can insert standard drafts" ON public.standard_drafts
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can update standard drafts" ON public.standard_drafts
  FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can delete standard drafts" ON public.standard_drafts
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));

CREATE INDEX standard_drafts_target_idx ON public.standard_drafts(target_kind, target_slug);
CREATE INDEX standard_drafts_status_idx ON public.standard_drafts(status, updated_at DESC);

CREATE TRIGGER update_standard_drafts_updated_at
  BEFORE UPDATE ON public.standard_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.project_standard_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  standard_slug text NOT NULL,
  applied_revision text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'review_needed',
  notes text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_standard_assignments_unique UNIQUE (client_id, standard_slug),
  CONSTRAINT project_standard_assignments_status_check CHECK (status IN ('compliant', 'review_needed', 'exception', 'not_applicable'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_standard_assignments TO authenticated;
GRANT ALL ON public.project_standard_assignments TO service_role;

ALTER TABLE public.project_standard_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view project standard assignments" ON public.project_standard_assignments
  FOR SELECT TO authenticated USING (public.is_admin_staff(auth.uid()));
CREATE POLICY "Managers can insert project standard assignments" ON public.project_standard_assignments
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can update project standard assignments" ON public.project_standard_assignments
  FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "Managers can delete project standard assignments" ON public.project_standard_assignments
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));

CREATE INDEX project_standard_assignments_client_idx ON public.project_standard_assignments(client_id);
CREATE INDEX project_standard_assignments_status_idx ON public.project_standard_assignments(status);

CREATE TRIGGER update_project_standard_assignments_updated_at
  BEFORE UPDATE ON public.project_standard_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();