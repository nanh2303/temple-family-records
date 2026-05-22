-- Add profile_picture_url field to devotees table
ALTER TABLE public.devotees
ADD COLUMN profile_picture_url text;

-- Create storage bucket for profile pictures if it doesn't exist
-- Note: This would be done via Supabase dashboard or CLI in production
-- INSERT INTO storage.buckets (id, name, public) VALUES ('devotee-profiles', 'devotee-profiles', false)
-- ON CONFLICT (id) DO NOTHING;

-- RLS policies for profile picture storage will be set up in a separate migration
-- or via Supabase dashboard after bucket creation
