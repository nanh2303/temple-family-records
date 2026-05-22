-- Fix RLS policies for profile picture feature
-- Ensure SELECT policies exist (required before UPDATE/DELETE)

-- Check and add SELECT policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotees' AND policyname = 'devotees_select_authenticated'
  ) THEN
    CREATE POLICY devotees_select_authenticated ON public.devotees FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_training_records' AND policyname = 'training_select_authenticated'
  ) THEN
    CREATE POLICY training_select_authenticated ON public.devotee_training_records FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_roles' AND policyname = 'roles_select_authenticated'
  ) THEN
    CREATE POLICY roles_select_authenticated ON public.devotee_roles FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_notes' AND policyname = 'notes_select_authenticated'
  ) THEN
    CREATE POLICY notes_select_authenticated ON public.devotee_notes FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devotee_afterlife_info' AND policyname = 'afterlife_select_authenticated'
  ) THEN
    CREATE POLICY afterlife_select_authenticated ON public.devotee_afterlife_info FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Ensure RLS is enabled on all tables
ALTER TABLE public.devotees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotee_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotee_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotee_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotee_afterlife_info ENABLE ROW LEVEL SECURITY;

-- Verify policies are in place (this will show what policies exist)
-- SELECT schemaname, tablename, policyname, permissive, cmd FROM pg_policies 
-- WHERE schemaname = 'public' ORDER BY tablename, policyname;
