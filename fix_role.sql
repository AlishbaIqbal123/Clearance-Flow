-- Fix constraints for profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer', 'hostel_officer'));
