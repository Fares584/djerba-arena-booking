
-- Mettre à jour l'heure de début des tarifs de nuit de 19:00 à 17:00
UPDATE public.app_settings 
SET setting_value = '17:00', 
    updated_at = NOW()
WHERE setting_name = 'heure_debut_nuit_globale';
