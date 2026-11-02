CREATE OR REPLACE FUNCTION public.search_devotees(query_text text)
RETURNS TABLE (
  id uuid,
  family_registry_no text,
  bhd_registry_no text,
  full_name text,
  dharma_name text,
  birth_date date,
  hometown text,
  address text,
  rank_score double precision
)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
WITH q AS (
  SELECT regexp_replace(
    lower(extensions.unaccent(trim(coalesce(query_text, '')))),
    '\s+',
    ' ',
    'g'
  ) AS nq
), normalized AS (
  SELECT
    d.*,
    regexp_replace(trim(coalesce(d.full_name_normalized, '')), '\s+', ' ', 'g') AS fn,
    regexp_replace(trim(coalesce(d.dharma_name_normalized, '')), '\s+', ' ', 'g') AS dn,
    regexp_replace(trim(coalesce(d.hometown_normalized, '')), '\s+', ' ', 'g') AS ht,
    regexp_replace(trim(coalesce(d.search_text, '')), '\s+', ' ', 'g') AS st
  FROM public.devotees d
), matches AS (
  SELECT
    n.*,
    q.nq,
    similarity(n.fn, q.nq) AS full_name_similarity,
    similarity(n.dn, q.nq) AS dharma_name_similarity,
    similarity(n.ht, q.nq) AS hometown_similarity,
    similarity(n.st, q.nq) AS other_similarity
  FROM normalized n
  CROSS JOIN q
), scored AS (
  SELECT
    m.*,
    GREATEST(
      CASE
        WHEN m.fn = m.nq THEN 10.0
        WHEN strpos(' ' || m.fn || ' ', ' ' || m.nq || ' ') > 0 THEN 9.75
        WHEN left(m.fn, length(m.nq)) = m.nq THEN 9.5
        WHEN strpos(m.fn, m.nq) > 0 THEN 9.0
        WHEN m.fn % m.nq THEN 8.0 + m.full_name_similarity
        ELSE 0.0
      END,
      CASE
        WHEN m.dn = m.nq THEN 7.0
        WHEN strpos(' ' || m.dn || ' ', ' ' || m.nq || ' ') > 0 THEN 6.75
        WHEN left(m.dn, length(m.nq)) = m.nq THEN 6.5
        WHEN strpos(m.dn, m.nq) > 0 THEN 6.0
        WHEN m.dn % m.nq THEN 5.0 + m.dharma_name_similarity
        ELSE 0.0
      END,
      CASE
        WHEN m.ht = m.nq THEN 4.0
        WHEN strpos(' ' || m.ht || ' ', ' ' || m.nq || ' ') > 0 THEN 3.75
        WHEN left(m.ht, length(m.nq)) = m.nq THEN 3.5
        WHEN strpos(m.ht, m.nq) > 0 THEN 3.0
        WHEN m.ht % m.nq THEN 2.0 + m.hometown_similarity
        ELSE 0.0
      END,
      CASE
        WHEN strpos(m.st, m.nq) > 0 THEN 1.5
        WHEN m.st % m.nq THEN 1.0 + m.other_similarity
        ELSE 0.0
      END
    )::double precision AS ranked_score
  FROM matches m
)
SELECT
  s.id,
  s.family_registry_no,
  s.bhd_registry_no,
  s.full_name,
  s.dharma_name,
  s.birth_date,
  s.hometown,
  s.address,
  s.ranked_score AS rank_score
FROM scored s
WHERE
  length(s.nq) >= 2
  AND (
    strpos(s.fn, s.nq) > 0
    OR s.fn % s.nq
    OR strpos(s.dn, s.nq) > 0
    OR s.dn % s.nq
    OR strpos(s.ht, s.nq) > 0
    OR s.ht % s.nq
    OR strpos(s.st, s.nq) > 0
    OR s.st % s.nq
  )
ORDER BY
  s.ranked_score DESC,
  s.full_name ASC
LIMIT 30;
$$;
