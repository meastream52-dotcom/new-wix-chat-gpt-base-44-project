-- =====================================================================
-- Athlete Opportunity Engine — 02 Generic functions
-- ---------------------------------------------------------------------
-- Reusable trigger/helper functions that do NOT depend on application
-- tables. Table-aware RLS helpers live in the policies migration.
-- =====================================================================

-- ---------------------------------------------------------------------
-- set_updated_at(): keep an `updated_at` column current on every UPDATE.
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE trigger: stamps updated_at = now().';

-- ---------------------------------------------------------------------
-- unaccent_fallback(): lightweight accent stripper so we do not require
-- the `unaccent` extension. Defined before slugify() because SQL
-- function bodies are validated at creation time.
-- ---------------------------------------------------------------------
create or replace function public.unaccent_fallback(value text)
returns text
language sql
immutable
strict
as $$
  select translate(
    value,
    'àáâãäåāăąèéêëēĕėęěìíîïĩīĭįòóôõöøōŏőùúûüũūŭůűñçćčš',
    'aaaaaaaaaeeeeeeeeeiiiiiiiiooooooooouuuuuuuuuncccs'
  );
$$;

-- ---------------------------------------------------------------------
-- slugify(): deterministic URL-safe slug from arbitrary text.
-- Used for school slugs and any other human-readable identifiers.
-- ---------------------------------------------------------------------
create or replace function public.slugify(value text)
returns text
language sql
immutable
strict
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(lower(public.unaccent_fallback(value)), '[^a-z0-9]+', '-', 'g'),
      '-{2,}', '-', 'g'
    )
  );
$$;

comment on function public.slugify(text) is
  'Returns a lower-case, hyphenated, ASCII-only slug for the given text.';
