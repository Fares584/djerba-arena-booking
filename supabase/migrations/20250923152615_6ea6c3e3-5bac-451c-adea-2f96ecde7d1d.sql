-- Fix critical security vulnerability: Restrict abonnements access to admins only
-- Currently, anyone can read customer names and phone numbers from abonnements table

-- Drop the insecure public read policy
DROP POLICY IF EXISTS "Abonnements lisibles par tous" ON public.abonnements;

-- Create secure admin-only read policy
CREATE POLICY "Abonnements readable by admins only" ON public.abonnements 
FOR SELECT 
TO public
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
));

-- Keep other policies as they are (already secure):
-- "Abonnements créables par tous" - allows creation (business requirement)
-- "Abonnements modifiables par les admins" - admin only updates
-- "Abonnements supprimables par les admins" - admin only deletes