-- Ajouter la colonne duree à la table abonnements
ALTER TABLE public.abonnements 
ADD COLUMN duree numeric NOT NULL DEFAULT 1.5;

-- Modifier la fonction generer_reservations_mensuelles pour utiliser la durée de l'abonnement
CREATE OR REPLACE FUNCTION public.generer_reservations_mensuelles(
  p_abonnement_id integer, 
  p_terrain_id integer, 
  p_mois integer, 
  p_annee integer, 
  p_jour_semaine integer, 
  p_heure text, 
  p_client_nom text, 
  p_client_tel text,
  p_duree numeric DEFAULT 1.5
)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  target_date DATE;
  first_day DATE;
  last_day DATE;
  days_to_add INTEGER;
BEGIN
  -- Premier et dernier jour du mois
  first_day := make_date(p_annee, p_mois, 1);
  last_day := (first_day + interval '1 month - 1 day')::date;
  
  -- Trouver le premier jour du mois qui correspond au jour de la semaine voulu
  target_date := first_day;
  days_to_add := (p_jour_semaine - EXTRACT(dow FROM target_date)::INTEGER) % 7;
  IF days_to_add < 0 THEN
    days_to_add := days_to_add + 7;
  END IF;
  target_date := target_date + days_to_add;

  -- Générer les réservations pour chaque semaine du mois
  WHILE target_date <= last_day LOOP
    INSERT INTO public.reservations (
      nom_client, tel, email, terrain_id, date, heure, duree, 
      statut, abonnement_id, remarque
    ) VALUES (
      p_client_nom, 
      COALESCE(p_client_tel, ''), 
      '', 
      p_terrain_id, 
      target_date, 
      p_heure, 
      p_duree,  -- Utiliser la durée passée en paramètre
      'confirmee', 
      p_abonnement_id,
      'Réservation automatique - Abonnement #' || p_abonnement_id || ' - ' || 
      CASE p_jour_semaine
        WHEN 0 THEN 'Dimanche'
        WHEN 1 THEN 'Lundi'
        WHEN 2 THEN 'Mardi'
        WHEN 3 THEN 'Mercredi'
        WHEN 4 THEN 'Jeudi'
        WHEN 5 THEN 'Vendredi'
        WHEN 6 THEN 'Samedi'
      END
    );
    
    target_date := target_date + INTERVAL '7 days';
  END LOOP;
END;
$function$;