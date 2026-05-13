-- Initial schema for temple-family-records
-- Normalized columns mirror "generated" behavior: Postgres STABLE `unaccent` cannot be used
-- inside GENERATED STORED columns, so a BEFORE INSERT/UPDATE trigger keeps them in sync.

SET search_path = public, extensions;

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.devotees_normalize_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  fn text := lower(extensions.unaccent(coalesce(NEW.full_name, '')));
  dn text := lower(extensions.unaccent(coalesce(NEW.dharma_name, '')));
  bp text := lower(extensions.unaccent(coalesce(NEW.birth_place, '')));
  ad text := lower(extensions.unaccent(coalesce(NEW.address, '')));
  ht text := lower(extensions.unaccent(coalesce(NEW.hometown, '')));
  fa text := lower(extensions.unaccent(coalesce(NEW.father_name, '')));
  mo text := lower(extensions.unaccent(coalesce(NEW.mother_name, '')));
BEGIN
  NEW.full_name_normalized := fn;
  NEW.dharma_name_normalized := dn;
  NEW.birth_place_normalized := bp;
  NEW.address_normalized := ad;
  NEW.hometown_normalized := ht;
  NEW.search_text := trim(
    both ' '
    from concat_ws(
      ' ',
      fn,
      dn,
      ht,
      bp,
      ad,
      fa,
      mo
    )
  );
  RETURN NEW;
END;
$$;

CREATE TABLE public.devotees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  family_registry_no text,
  bhd_registry_no text,
  full_name text NOT NULL,
  full_name_normalized text NOT NULL DEFAULT '',
  birth_date date,
  birth_place text,
  birth_place_normalized text NOT NULL DEFAULT '',
  dharma_name text,
  dharma_name_normalized text NOT NULL DEFAULT '',
  address text,
  address_normalized text NOT NULL DEFAULT '',
  hometown text,
  hometown_normalized text NOT NULL DEFAULT '',
  joined_unit_date date,
  vow_date date,
  refuge_date date,
  preceptor text,
  father_name text,
  mother_name text,
  search_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER devotees_set_updated_at
BEFORE UPDATE ON public.devotees
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER devotees_normalize_fields_trg
BEFORE INSERT OR UPDATE OF full_name,
dharma_name,
birth_place,
address,
hometown,
father_name,
mother_name ON public.devotees
FOR EACH ROW
EXECUTE PROCEDURE public.devotees_normalize_fields();

CREATE INDEX idx_devotees_search_text_trgm ON public.devotees USING gin (search_text gin_trgm_ops);

CREATE INDEX idx_devotees_full_name_norm_trgm ON public.devotees USING gin (full_name_normalized gin_trgm_ops);

CREATE INDEX idx_devotees_hometown_norm_trgm ON public.devotees USING gin (hometown_normalized gin_trgm_ops);

CREATE INDEX idx_devotees_birth_date ON public.devotees (birth_date);

CREATE INDEX idx_devotees_family_registry_no ON public.devotees (family_registry_no);

CREATE INDEX idx_devotees_bhd_registry_no ON public.devotees (bhd_registry_no);

CREATE TABLE public.devotee_training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  devotee_id uuid NOT NULL REFERENCES public.devotees (id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  completed_date date,
  decision_no text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_training_devotee ON public.devotee_training_records (devotee_id);

CREATE TABLE public.devotee_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  devotee_id uuid NOT NULL REFERENCES public.devotees (id) ON DELETE CASCADE,
  role_title text NOT NULL,
  organization text,
  start_date date,
  end_date date,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_roles_devotee ON public.devotee_roles (devotee_id);

CREATE TABLE public.devotee_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  devotee_id uuid NOT NULL REFERENCES public.devotees (id) ON DELETE CASCADE,
  note_type text NOT NULL CHECK (
    note_type IN ('achievement', 'comment', 'other')
  ),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_devotee ON public.devotee_notes (devotee_id);

CREATE TABLE public.devotee_afterlife_info (
  devotee_id uuid PRIMARY KEY REFERENCES public.devotees (id) ON DELETE CASCADE,
  death_date date,
  grave_location text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER devotee_afterlife_set_updated_at
BEFORE UPDATE ON public.devotee_afterlife_info
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

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
  SELECT
    lower(extensions.unaccent(trim(coalesce(query_text, '')))) AS nq
)
SELECT
  d.id,
  d.family_registry_no,
  d.bhd_registry_no,
  d.full_name,
  d.dharma_name,
  d.birth_date,
  d.hometown,
  d.address,
  (
    coalesce(similarity(d.full_name_normalized, q.nq), 0) * 4.0 + coalesce(similarity(d.dharma_name_normalized, q.nq), 0) * 3.0 + coalesce(similarity(d.hometown_normalized, q.nq), 0) * 2.5 + coalesce(similarity(d.search_text, q.nq), 0) * 1.5
  )::double precision AS rank_score
FROM
  public.devotees d
  CROSS JOIN q
WHERE
  length(q.nq) >= 2
  AND (
    d.search_text % q.nq
    OR d.full_name_normalized % q.nq
    OR d.dharma_name_normalized % q.nq
    OR d.hometown_normalized % q.nq
    OR d.search_text ILIKE '%' || replace(q.nq, ' ', '%') || '%'
  )
ORDER BY
  rank_score DESC NULLS LAST,
  d.full_name ASC
LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION public.search_devotees(text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.search_devotees(text) TO service_role;

ALTER TABLE public.devotees ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.devotee_training_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.devotee_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.devotee_notes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.devotee_afterlife_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY devotees_select_authenticated ON public.devotees FOR SELECT TO authenticated USING (true);

CREATE POLICY training_select_authenticated ON public.devotee_training_records FOR SELECT TO authenticated USING (true);

CREATE POLICY roles_select_authenticated ON public.devotee_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY notes_select_authenticated ON public.devotee_notes FOR SELECT TO authenticated USING (true);

CREATE POLICY afterlife_select_authenticated ON public.devotee_afterlife_info FOR SELECT TO authenticated USING (true);

-- Service role bypasses RLS by default; explicit grants for anon are omitted on purpose.
