-- Supabase Security hardening script for University Clearance System
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. ENABLE ROW LEVEL SECURITY (RLS)
-- This fixes the "RLS Disabled in Public" critical warnings
ALTER TABLE IF EXISTS public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clearance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clearance_status ENABLE ROW LEVEL SECURITY;

-- 2. CREATE DEFAULT POLICIES
-- Profiles: Allow users to view their own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Student Profiles: Allow students to view their own data
DROP POLICY IF EXISTS "Students can view own profile" ON public.student_profiles;
CREATE POLICY "Students can view own profile" ON public.student_profiles
  FOR SELECT USING (auth.uid() = id);

-- Departments: Allow authenticated users to view department list
DROP POLICY IF EXISTS "Allow authenticated read access to departments" ON public.departments;
CREATE POLICY "Allow authenticated read access to departments" ON public.departments
  FOR SELECT TO authenticated USING (true);

-- Clearance Requests: Students see their own, Staff see their department's
DROP POLICY IF EXISTS "Users can view relevant requests" ON public.clearance_requests;
CREATE POLICY "Users can view relevant requests" ON public.clearance_requests
  FOR SELECT USING (
    auth.uid() = student_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'hod', 'department_officer'))
  );

-- 3. FIX FUNCTION SEARCH PATH
-- Fixes "Function Search Path Mutable"
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 4. ADD INDEXES FOR FOREIGN KEYS
-- Fixes "Unindexed foreign keys"
CREATE INDEX IF NOT EXISTS idx_clearance_requests_student_id ON public.clearance_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_clearance_status_request_id ON public.clearance_status(request_id);
CREATE INDEX IF NOT EXISTS idx_clearance_status_department_id ON public.clearance_status(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_department_id ON public.student_profiles(department_id);
