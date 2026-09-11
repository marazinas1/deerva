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
        FROM cur
        GROUP BY date_trunc('day', created_at AT TIME ZONE 'UTC')
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
          'code', code,
          'views', count(*),
          'visitors', count(DISTINCT session_id)
        ) AS x
        FROM (
          SELECT CASE WHEN country_code = '' THEN 'XX' ELSE upper(country_code) END AS code,
                 session_id
          FROM cur
        ) t
        GROUP BY code ORDER BY count(*) DESC LIMIT 12
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