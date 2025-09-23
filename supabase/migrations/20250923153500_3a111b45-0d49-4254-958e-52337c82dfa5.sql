-- Fix RLS policy violation for reservations table
-- Drop all existing policies and recreate them properly

DROP POLICY IF EXISTS "Admin delete only" ON public.reservations;
DROP POLICY IF EXISTS "Admin read only" ON public.reservations;  
DROP POLICY IF EXISTS "Admin update only" ON public.reservations;
DROP POLICY IF EXISTS "Allow public reservations" ON public.reservations;

-- Recreate policies with correct configuration

-- Allow public INSERT for new reservations (no authentication required)
CREATE POLICY "Public can create reservations" ON public.reservations
FOR INSERT 
TO public
WITH CHECK (true);

-- Admin can read all reservations
CREATE POLICY "Admins can read reservations" ON public.reservations
FOR SELECT 
TO public
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
));

-- Admin can update reservations
CREATE POLICY "Admins can update reservations" ON public.reservations
FOR UPDATE 
TO public
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
));

-- Admin can delete reservations
CREATE POLICY "Admins can delete reservations" ON public.reservations
FOR DELETE 
TO public
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
));