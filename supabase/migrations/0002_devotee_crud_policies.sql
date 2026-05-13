-- Open write access for the admin-only app.
-- The application currently treats every authenticated user as an admin; replace
-- these broad policies with role-claim checks before adding non-admin accounts.

CREATE POLICY devotees_insert_authenticated ON public.devotees FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY devotees_update_authenticated ON public.devotees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY devotees_delete_authenticated ON public.devotees FOR DELETE TO authenticated USING (true);

CREATE POLICY training_insert_authenticated ON public.devotee_training_records FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY training_update_authenticated ON public.devotee_training_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY training_delete_authenticated ON public.devotee_training_records FOR DELETE TO authenticated USING (true);

CREATE POLICY roles_insert_authenticated ON public.devotee_roles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY roles_update_authenticated ON public.devotee_roles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY roles_delete_authenticated ON public.devotee_roles FOR DELETE TO authenticated USING (true);

CREATE POLICY notes_insert_authenticated ON public.devotee_notes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY notes_update_authenticated ON public.devotee_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY notes_delete_authenticated ON public.devotee_notes FOR DELETE TO authenticated USING (true);

CREATE POLICY afterlife_insert_authenticated ON public.devotee_afterlife_info FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY afterlife_update_authenticated ON public.devotee_afterlife_info FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY afterlife_delete_authenticated ON public.devotee_afterlife_info FOR DELETE TO authenticated USING (true);
