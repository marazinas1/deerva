ALTER TABLE public.user_roles DISABLE TRIGGER guard_user_roles_changes;
DELETE FROM public.user_roles WHERE user_id = '01ce37e9-0986-4f89-9f8f-c51c7bcc4a4b';
ALTER TABLE public.user_roles ENABLE TRIGGER guard_user_roles_changes;