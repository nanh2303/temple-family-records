-- Enable RLS on devotees table and ensure it's properly configured
-- This is needed for the profile_picture_url field to work correctly

ALTER TABLE public.devotees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotee_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotee_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotee_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotee_afterlife_info ENABLE ROW LEVEL SECURITY;

-- Make sure there's a default SELECT policy for read access
CREATE POLICY devotees_select_authenticated ON public.devotees
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY training_select_authenticated ON public.devotee_training_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY roles_select_authenticated ON public.devotee_roles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY notes_select_authenticated ON public.devotee_notes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY afterlife_select_authenticated ON public.devotee_afterlife_info
  FOR SELECT TO authenticated
  USING (true);
