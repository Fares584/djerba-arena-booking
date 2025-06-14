
-- Créer une fonction pour annuler automatiquement les réservations non confirmées après 15 minutes
CREATE OR REPLACE FUNCTION public.annuler_reservations_non_confirmees()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE reservations
  SET statut = 'annulee'
  WHERE statut = 'en_attente'
    AND confirmed_by_user = false
    AND created_at < now() - INTERVAL '15 minutes';
END;
$$;

-- Activer l’extension pg_cron si ce n’est pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Planifier la fonction : l’exécuter toutes les minutes
SELECT
  cron.schedule(
    'annuler_reservations_non_confirmees_toutes_les_minutes',
    '* * * * *',
    $$ SELECT public.annuler_reservations_non_confirmees(); $$
  );
