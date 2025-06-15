
-- Met à jour la fonction pour générer exactement une réservation par semaine, le bon jour de semaine, dans la période d'abonnement indiquée
CREATE OR REPLACE FUNCTION generer_reservations_abonnement(
  p_abonnement_id INTEGER,
  p_terrain_id INTEGER,
  p_date_debut DATE,
  p_date_fin DATE,
  p_jour_semaine INTEGER,
  p_heure TEXT,
  p_duree NUMERIC,
  p_client_nom TEXT,
  p_client_tel TEXT,
  p_client_email TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  target_date DATE;
  days_to_add INTEGER;
BEGIN
  -- Trouver le premier jour voulu à partir de la date_debut
  target_date := p_date_debut;
  days_to_add := (p_jour_semaine - EXTRACT(dow FROM target_date)::INTEGER);
  IF days_to_add < 0 THEN
    days_to_add := days_to_add + 7;
  END IF;
  target_date := target_date + days_to_add;

  -- Générer les réservations chaque semaine, jusqu'à la date de fin incluse
  WHILE target_date <= p_date_fin LOOP
    INSERT INTO public.reservations (
      nom_client, tel, email, terrain_id, date, heure, duree, 
      statut, abonnement_id, remarque
    ) VALUES (
      p_client_nom, p_client_tel, p_client_email, p_terrain_id, 
      target_date, p_heure, p_duree, 'confirmee', p_abonnement_id,
      'Réservation automatique - Abonnement #' || p_abonnement_id
    );
    target_date := target_date + INTERVAL '7 days';
  END LOOP;
END;
$$;
