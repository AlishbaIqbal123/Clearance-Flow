-- Fix: clearance_requests.student_id incorrectly references "users" table
-- Students are stored in "student_profiles" not "users"

-- Step 1: Drop the broken foreign key constraint
ALTER TABLE clearance_requests
  DROP CONSTRAINT IF EXISTS clearance_requests_student_id_fkey;

-- Step 2: Add the correct foreign key pointing to student_profiles
ALTER TABLE clearance_requests
  ADD CONSTRAINT clearance_requests_student_id_fkey
  FOREIGN KEY (student_id)
  REFERENCES student_profiles(id)
  ON DELETE CASCADE;
