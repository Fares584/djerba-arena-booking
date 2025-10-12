-- Fix search_path for the check_reservation_overlap function
CREATE OR REPLACE FUNCTION check_reservation_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_end_time TIME;
  v_existing_count INTEGER;
BEGIN
  -- Calculate end time of the new reservation
  v_end_time := (NEW.heure::TIME + (NEW.duree || ' hours')::INTERVAL)::TIME;
  
  -- Check for overlapping reservations with status 'en_attente' or 'confirmee'
  SELECT COUNT(*) INTO v_existing_count
  FROM reservations
  WHERE terrain_id = NEW.terrain_id
    AND date = NEW.date
    AND statut IN ('en_attente', 'confirmee')
    AND id != COALESCE(NEW.id, 0)
    AND (
      (heure::TIME < v_end_time AND (heure::TIME + (duree || ' hours')::INTERVAL)::TIME > NEW.heure::TIME)
    );
  
  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'Ce créneau horaire est déjà réservé. Veuillez choisir un autre créneau.'
      USING ERRCODE = '23505';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;