
-- Créer une table pour les paramètres globaux de l'application
CREATE TABLE public.app_settings (
  id SERIAL PRIMARY KEY,
  setting_name VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer le paramètre global pour l'heure de début des tarifs de nuit
INSERT INTO public.app_settings (setting_name, setting_value, description) 
VALUES ('heure_debut_nuit_globale', '19:00', 'Heure globale de début des tarifs de nuit pour tous les terrains');

-- Supprimer la colonne heure_debut_nuit de la table terrains car elle sera gérée globalement
ALTER TABLE public.terrains DROP COLUMN IF EXISTS heure_debut_nuit;

-- Ajouter un commentaire sur la table
COMMENT ON TABLE public.app_settings IS 'Table pour stocker les paramètres globaux de l''application';
