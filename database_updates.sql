-- SQL Script to update Supabase schema for University Clearance System
-- Run this in the Supabase SQL Editor

-- 1. Add missing auth columns and defaults to profiles table
ALTER TABLE public.profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;

-- 2. Add missing auth columns and defaults to student_profiles table
ALTER TABLE public.student_profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;

-- 3. Ensure we have the proper constraint for department types
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_type_check;
ALTER TABLE public.departments ADD CONSTRAINT departments_type_check 
CHECK (type IN ('academic', 'administrative', 'finance', 'library', 'transport', 'hostel', 'other'));
