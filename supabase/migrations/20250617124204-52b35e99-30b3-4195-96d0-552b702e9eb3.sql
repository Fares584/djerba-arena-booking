
-- Générer un token de confirmation unique pour chaque réservation
UPDATE public.reservations 
SET confirmation_token = gen_random_uuid()::text 
WHERE confirmation_token IS NULL;

-- Fonction pour générer automatiquement un token lors de l'insertion
CREATE OR REPLACE FUNCTION generate_confirmation_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_token IS NULL THEN
    NEW.confirmation_token := gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le token
DROP TRIGGER IF EXISTS set_confirmation_token ON public.reservations;
CREATE TRIGGER set_confirmation_token
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION generate_confirmation_token();
