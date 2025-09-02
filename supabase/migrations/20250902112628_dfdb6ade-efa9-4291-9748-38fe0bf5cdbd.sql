-- Fix security vulnerability: Restrict reservations SELECT access to admin users only
-- This prevents public access to sensitive customer data (names, phones, emails)

-- Drop the current public SELECT policy
DROP POLICY IF EXISTS "Réservations lisibles par tous" ON public.reservations;

-- Create new restricted SELECT policy for admin users only
CREATE POLICY "Réservations lisibles par les admins seulement" 
ON public.reservations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE admin_users.id = auth.uid()
  )
);

-- Ensure RLS is still enabled
ALTER TABLE public.reservations FORCE ROW LEVEL SECURITY;