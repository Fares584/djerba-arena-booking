
-- Ajouter une colonne pour définir l'heure de début des tarifs de nuit
ALTER TABLE public.terrains 
ADD COLUMN heure_debut_nuit TIME DEFAULT '19:00:00';

-- Mettre à jour les terrains existants avec l'heure par défaut
UPDATE public.terrains 
SET heure_debut_nuit = '19:00:00' 
WHERE heure_debut_nuit IS NULL;

-- Ajouter un commentaire pour expliquer la colonne
COMMENT ON COLUMN public.terrains.heure_debut_nuit IS 'Heure à partir de laquelle le tarif de nuit s''applique (format HH:MM:SS)';
