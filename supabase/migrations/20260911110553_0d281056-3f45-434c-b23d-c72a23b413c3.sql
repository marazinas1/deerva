REVOKE ALL ON FUNCTION public.prune_page_views() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prune_page_views() TO service_role;