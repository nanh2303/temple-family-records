# Search design

## Goals

Admins often remember fragments (e.g. “Dung” + “Quảng Ngãi”) and may omit Vietnamese tones. The system must:

1. Fold Vietnamese accents consistently.
2. Fuzzy-match partial tokens quickly at database scale.
3. Rank results so legal name and dharma name matches surface before generic text hits.

## Normalization

- **Database** — `extensions.unaccent` plus `lower` populate `full_name_normalized`, `dharma_name_normalized`, `hometown_normalized`, and a combined `search_text` column (maintained in a `BEFORE INSERT OR UPDATE` trigger on the relevant source columns).
- **Client** — `normalizeVietnameseClient` performs a lightweight Unicode NFD strip for UX only; **authoritative** matching is always on the server.

## Trigram indexes

GIN indexes using `gin_trgm_ops` exist on:

- `search_text` — broad net for multi-token queries.
- `full_name_normalized` — fast name scans.
- `hometown_normalized` — locality-heavy queries.

Additional B-tree indexes support exact filters on `birth_date` and registry numbers.

## `search_devotees` RPC

Input `query_text` is folded with `lower(extensions.unaccent(trim(...)))`.

**Filtering** uses the pg_trgm `%` operator (similarity above `pg_trgm.similarity_threshold`) across `search_text`, name, dharma name, and hometown columns, plus a conservative `ILIKE` fallback for spaced tokens.

**Ranking** combines `similarity` scores with weights:

- `full_name_normalized` — highest weight.
- `dharma_name_normalized` — high weight.
- `hometown_normalized` — medium-high weight.
- `search_text` — medium weight (catch-all).

Results are ordered by `rank_score` descending, then `full_name`, limited to **20** rows.

## Why not a custom Trie?

Trie structures in application memory duplicate what Postgres already optimizes with GIN + `pg_trgm`, add deployment complexity, and fight the goal of keeping search logic declarative in SQL where ranking and indexes evolve with the schema.
