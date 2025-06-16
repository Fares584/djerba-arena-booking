
-- Supprimer la tâche cron qui annule automatiquement les réservations
SELECT cron.unschedule('annuler_reservations_non_confirmees_toutes_les_minutes');

-- Supprimer la fonction d'annulation automatique
DROP FUNCTION IF EXISTS public.annuler_reservations_non_confirmees();
