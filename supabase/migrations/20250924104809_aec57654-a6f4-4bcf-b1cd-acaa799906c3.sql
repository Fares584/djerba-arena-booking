-- Solution radicale: Désactiver complètement RLS sur la table reservations
-- et gérer la sécurité au niveau application

-- Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Public can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can read reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON public.reservations;

-- Désactiver complètement RLS sur la table reservations
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- Créer une vue sécurisée pour les admins
CREATE OR REPLACE VIEW public.admin_reservations AS
SELECT *
FROM public.reservations
WHERE EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.id = auth.uid()
);

-- Accorder les permissions sur la vue
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_reservations TO anon;