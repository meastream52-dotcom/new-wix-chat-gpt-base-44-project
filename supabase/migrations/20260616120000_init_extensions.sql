-- =====================================================================
-- Athlete Opportunity Engine — 00 Extensions
-- ---------------------------------------------------------------------
-- Installs every extension the platform depends on. All extensions are
-- created in the dedicated `extensions` schema (Supabase best practice)
-- so the `public` schema stays clean and reserved for application data.
-- Types and operator classes are referenced schema-qualified elsewhere
-- (e.g. extensions.vector, extensions.vector_cosine_ops).
-- =====================================================================

create schema if not exists extensions;

-- gen_random_uuid(), digest()/gen_salt() crypto helpers.
create extension if not exists "pgcrypto" with schema extensions;

-- Trigram similarity for fuzzy name search (schools, athletes).
create extension if not exists "pg_trgm" with schema extensions;

-- Case-insensitive text (emails, slugs).
create extension if not exists "citext" with schema extensions;

-- pgvector — embeddings for AI matching, semantic video/school search
-- and future AI agent / scholarship-engine retrieval.
create extension if not exists "vector" with schema extensions;

-- Make the extension schema resolvable for the API roles so unqualified
-- extension functions/types resolve predictably inside SECURITY DEFINER
-- helpers and generated columns.
grant usage on schema extensions to anon, authenticated, service_role;

-- Add `extensions` to the database search_path so pgvector operators
-- (<->, <=>, <#>) and types resolve unqualified in application queries.
-- Takes effect on new connections (PostgREST/clients reconnect per query).
do $$
begin
  execute format(
    'alter database %I set search_path to %s',
    current_database(),
    '"$user", public, extensions'
  );
end $$;
