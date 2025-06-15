
-- 1. Supprimer la clé étrangère dans abonnements (si existe)
ALTER TABLE public.abonnements DROP CONSTRAINT IF EXISTS abonnements_abonnement_type_id_fkey;

-- 2. Supprimer la colonne abonnement_type_id
ALTER TABLE public.abonnements DROP COLUMN IF EXISTS abonnement_type_id;

-- 3. Supprimer la table abonnement_types
DROP TABLE IF EXISTS public.abonnement_types;
