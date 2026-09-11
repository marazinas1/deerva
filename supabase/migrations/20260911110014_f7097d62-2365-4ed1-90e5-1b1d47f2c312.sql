CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  session_id text NOT NULL,
  referrer text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  country_code text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT 'unknown',
  engaged boolean NOT NULL DEFAULT false,
  is_bot boolean NOT NULL DEFAULT false,
  duration_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read page_views" ON public.page_views;
CREATE POLICY "Staff read page_views" ON public.page_views
  FOR SELECT TO authenticated USING (public.is_admin_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_country_idx ON public.page_views (country_code);
CREATE INDEX IF NOT EXISTS page_views_engaged_idx ON public.page_views (created_at DESC) WHERE engaged AND NOT is_bot;

CREATE OR REPLACE FUNCTION public.analytics_summary(
  _from date,
  _to date,
  _include_short boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  span int := GREATEST((_to - _from) + 1, 1);
  prev_from date := _from - span;
  prev_to date := _from - 1;
BEGIN
  IF NOT public.is_admin_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied.';
  END IF;

  WITH cur AS (
    SELECT * FROM public.page_views
    WHERE created_at >= _from::timestamptz AND created_at < (_to + 1)::timestamptz
      AND is_bot = false
      AND (_include_short OR engaged = true)
  ), prev AS (
    SELECT * FROM public.page_views
    WHERE created_at >= prev_from::timestamptz AND created_at < (prev_to + 1)::timestamptz
      AND is_bot = false
      AND (_include_short OR engaged = true)
  ), sessions AS (
    SELECT session_id, count(*) AS views, sum(duration_ms) AS total_ms
    FROM cur GROUP BY session_id
  )
  SELECT jsonb_build_object(
    'totals', jsonb_build_object(
      'views', (SELECT count(*) FROM cur),
      'visitors', (SELECT count(DISTINCT session_id) FROM cur)
    ),
    'previous', jsonb_build_object(
      'views', (SELECT count(*) FROM prev),
      'visitors', (SELECT count(DISTINCT session_id) FROM prev)
    ),
    'avg_duration_ms', COALESCE((SELECT round(avg(total_ms))::int FROM sessions), 0),
    'bounce_rate', COALESCE((
      SELECT round(100.0 * count(*) FILTER (WHERE views = 1) / NULLIF(count(*), 0))::int
      FROM sessions
    ), 0),
    'pages_per_visit', COALESCE((SELECT round(avg(views), 1) FROM sessions), 0),
    'daily', COALESCE((
      SELECT jsonb_agg(x ORDER BY x->>'day')
      FROM (
        SELECT jsonb_build_object(
          'day', to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD'),
          'views', count(*),
          'visitors', count(DISTINCT session_id)
        ) AS x
        FROM cur GROUP BY 1
      ) d
    ), '[]'::jsonb),
    'top_pages', COALESCE((
      SELECT jsonb_agg(x)
      FROM (
        SELECT jsonb_build_object('path', path, 'views', count(*)) AS x
        FROM cur GROUP BY path ORDER BY count(*) DESC LIMIT 10
      ) p
    ), '[]'::jsonb),
    'countries', COALESCE((
      SELECT jsonb_agg(x)
      FROM (
        SELECT jsonb_build_object(
          'code', CASE WHEN country_code = '' THEN 'XX' ELSE upper(country_code) END,
          'views', count(*),
          'visitors', count(DISTINCT session_id)
        ) AS x
        FROM cur
        GROUP BY 1 ORDER BY count(*) DESC LIMIT 12
      ) c
    ), '[]'::jsonb),
    'sources', COALESCE((
      SELECT jsonb_agg(x)
      FROM (
        SELECT jsonb_build_object('source', s, 'views', count(*)) AS x
        FROM (
          SELECT CASE
            WHEN referrer = '' THEN 'direct'
            WHEN referrer ILIKE '%google%' THEN 'google'
            WHEN referrer ILIKE '%bing%' OR referrer ILIKE '%duckduckgo%' OR referrer ILIKE '%yahoo%' THEN 'search'
            WHEN referrer ILIKE '%linkedin%' THEN 'linkedin'
            WHEN referrer ILIKE '%facebook%' THEN 'facebook'
            WHEN referrer ILIKE '%instagram%' THEN 'instagram'
            WHEN referrer ILIKE '%chatgpt%' OR referrer ILIKE '%perplexity%' OR referrer ILIKE '%claude%' THEN 'ai'
            ELSE 'other'
          END AS s
          FROM cur
        ) t
        GROUP BY s ORDER BY count(*) DESC
      ) q
    ), '[]'::jsonb),
    'devices', COALESCE((
      SELECT jsonb_agg(x)
      FROM (
        SELECT jsonb_build_object('device', d, 'views', count(*)) AS x
        FROM (SELECT device AS d FROM cur) t
        GROUP BY d ORDER BY count(*) DESC
      ) q
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_summary(date, date, boolean) FROM public;
REVOKE ALL ON FUNCTION public.analytics_summary(date, date, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.analytics_summary(date, date, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.prune_page_views()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.page_views WHERE created_at < now() - interval '14 months';
$$;

REVOKE ALL ON FUNCTION public.prune_page_views() FROM public;
GRANT EXECUTE ON FUNCTION public.prune_page_views() TO service_role;