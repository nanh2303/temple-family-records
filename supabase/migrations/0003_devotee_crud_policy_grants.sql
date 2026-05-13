-- Ensure authenticated app users can write devotee records in the admin-only app.
-- This migration is intentionally idempotent so it can repair databases where
-- 0002_devotee_crud_policies.sql was not applied before CRUD testing.

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.devotees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devotee_training_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devotee_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devotee_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devotee_afterlife_info TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotees' AND policyname = 'devotees_insert_authenticated'
  ) THEN
    CREATE POLICY devotees_insert_authenticated ON public.devotees FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotees' AND policyname = 'devotees_update_authenticated'
  ) THEN
    CREATE POLICY devotees_update_authenticated ON public.devotees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotees' AND policyname = 'devotees_delete_authenticated'
  ) THEN
    CREATE POLICY devotees_delete_authenticated ON public.devotees FOR DELETE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_training_records' AND policyname = 'training_insert_authenticated'
  ) THEN
    CREATE POLICY training_insert_authenticated ON public.devotee_training_records FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_training_records' AND policyname = 'training_update_authenticated'
  ) THEN
    CREATE POLICY training_update_authenticated ON public.devotee_training_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_training_records' AND policyname = 'training_delete_authenticated'
  ) THEN
    CREATE POLICY training_delete_authenticated ON public.devotee_training_records FOR DELETE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_roles' AND policyname = 'roles_insert_authenticated'
  ) THEN
    CREATE POLICY roles_insert_authenticated ON public.devotee_roles FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_roles' AND policyname = 'roles_update_authenticated'
  ) THEN
    CREATE POLICY roles_update_authenticated ON public.devotee_roles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_roles' AND policyname = 'roles_delete_authenticated'
  ) THEN
    CREATE POLICY roles_delete_authenticated ON public.devotee_roles FOR DELETE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_notes' AND policyname = 'notes_insert_authenticated'
  ) THEN
    CREATE POLICY notes_insert_authenticated ON public.devotee_notes FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_notes' AND policyname = 'notes_update_authenticated'
  ) THEN
    CREATE POLICY notes_update_authenticated ON public.devotee_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_notes' AND policyname = 'notes_delete_authenticated'
  ) THEN
    CREATE POLICY notes_delete_authenticated ON public.devotee_notes FOR DELETE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_afterlife_info' AND policyname = 'afterlife_insert_authenticated'
  ) THEN
    CREATE POLICY afterlife_insert_authenticated ON public.devotee_afterlife_info FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_afterlife_info' AND policyname = 'afterlife_update_authenticated'
  ) THEN
    CREATE POLICY afterlife_update_authenticated ON public.devotee_afterlife_info FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_afterlife_info' AND policyname = 'afterlife_delete_authenticated'
  ) THEN
    CREATE POLICY afterlife_delete_authenticated ON public.devotee_afterlife_info FOR DELETE TO authenticated USING (true);
  END IF;
END $$;
