-- SQL Script to add degree_fulfillment column to clearance_requests
-- Run this in the Supabase SQL Editor

ALTER TABLE public.clearance_requests 
ADD COLUMN IF NOT EXISTS degree_fulfillment JSONB DEFAULT NULL;

-- Optional: Add index for performance if needed
-- CREATE INDEX IF NOT EXISTS idx_clearance_requests_fulfillment ON public.clearance_requests USING GIN (degree_fulfillment);
