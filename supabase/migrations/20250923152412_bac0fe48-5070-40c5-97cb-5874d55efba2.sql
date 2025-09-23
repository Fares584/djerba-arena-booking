-- Temporarily disable RLS for the reservations table to allow public insertions
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable insert for all users" ON public.reservations;
DROP POLICY IF EXISTS "Enable read for admins only" ON public.reservations;
DROP POLICY IF EXISTS "Enable update for admins only" ON public.reservations;
DROP POLICY IF EXISTS "Enable delete for admins only" ON public.reservations;

-- Create a completely permissive INSERT policy for public reservations
CREATE POLICY "Allow public reservations" ON public.reservations 
FOR INSERT 
TO public
WITH CHECK (true);

-- Create SELECT policy for admins only
CREATE POLICY "Admin read only" ON public.reservations 
FOR SELECT 
TO public
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
));

-- Create UPDATE policy for admins only
CREATE POLICY "Admin update only" ON public.reservations 
FOR UPDATE 
TO public
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
));

-- Create DELETE policy for admins only
CREATE POLICY "Admin delete only" ON public.reservations 
FOR DELETE 
TO public
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
));