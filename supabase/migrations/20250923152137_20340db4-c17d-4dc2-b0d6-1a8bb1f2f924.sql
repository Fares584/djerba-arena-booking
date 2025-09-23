-- Fix RLS policies for reservations table to allow public reservation creation

-- Drop existing policies
DROP POLICY IF EXISTS "Création de réservations par tous" ON public.reservations;
DROP POLICY IF EXISTS "Réservations lisibles par les admins seulement" ON public.reservations;
DROP POLICY IF EXISTS "Réservations modifiables par les admins" ON public.reservations;
DROP POLICY IF EXISTS "Réservations supprimables par les admins" ON public.reservations;

-- Recreate policies with correct permissions
-- Allow anyone to create reservations (public reservation system)
CREATE POLICY "Enable insert for all users" ON public.reservations 
FOR INSERT 
WITH CHECK (true);

-- Allow only admins to read reservations
CREATE POLICY "Enable read for admins only" ON public.reservations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
));

-- Allow only admins to update reservations
CREATE POLICY "Enable update for admins only" ON public.reservations 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
));

-- Allow only admins to delete reservations
CREATE POLICY "Enable delete for admins only" ON public.reservations 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
));