-- Drop foreign key constraints linking to auth.users if we are managing custom auth directly
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_id_fkey;
