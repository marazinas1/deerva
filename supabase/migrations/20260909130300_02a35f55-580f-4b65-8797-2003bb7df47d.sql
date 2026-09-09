-- One role per person (developer -> owner -> editor)
DELETE FROM public.user_roles a USING public.user_roles b
  WHERE a.user_id = b.user_id AND a.created_at > b.created_at;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Hardcoded developer account
CREATE OR REPLACE FUNCTION public.developer_email()
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $$ SELECT 'rutkusmarius@gmail.com'::text $$;

CREATE OR REPLACE FUNCTION public.is_developer(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'developer')
$$;

REVOKE ALL ON FUNCTION public.developer_email() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_developer(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_developer(uuid) TO authenticated;

-- Guard: protects the developer row and the last owner
CREATE OR REPLACE FUNCTION public.guard_user_roles()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  remaining int;
  service boolean := coalesce(auth.role(), '') = 'service_role';
  target_email text;
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') AND OLD.role = 'developer' AND NOT public.is_developer(auth.uid()) THEN
    RAISE EXCEPTION 'Developer accounts cannot be modified.';
  END IF;

  IF TG_OP IN ('INSERT','UPDATE') AND NEW.role = 'developer' THEN
    SELECT lower(email) INTO target_email FROM auth.users WHERE id = NEW.user_id;
    IF target_email IS DISTINCT FROM public.developer_email()
       AND NOT public.is_developer(auth.uid()) THEN
      RAISE EXCEPTION 'The developer role cannot be granted.';
    END IF;
  END IF;

  IF NOT public.is_developer(auth.uid()) AND NOT service
     AND ((TG_OP = 'DELETE' AND OLD.role = 'owner')
          OR (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role <> 'owner')) THEN
    SELECT count(*) INTO remaining FROM public.user_roles r
      WHERE r.role = 'owner' AND r.id <> OLD.id;
    IF remaining = 0 THEN
      RAISE EXCEPTION 'At least one owner account must remain.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_user_roles() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_user_roles_changes ON public.user_roles;
CREATE TRIGGER guard_user_roles_changes
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.guard_user_roles();

-- The hardcoded developer gets the role automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = public.developer_email() THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'developer')
    ON CONFLICT (user_id) DO UPDATE SET role = 'developer';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
