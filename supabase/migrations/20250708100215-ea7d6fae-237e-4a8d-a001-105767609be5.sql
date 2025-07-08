
-- Supprimer les anciennes colonnes et ajouter les nouvelles
ALTER TABLE public.abonnements 
DROP COLUMN IF EXISTS date_debut,
DROP COLUMN IF EXISTS date_fin,
DROP COLUMN IF EXISTS duree_seance,
DROP COLUMN IF EXISTS reservations_utilisees,
DROP COLUMN IF EXISTS montant,
DROP COLUMN IF EXISTS client_email;

-- Ajouter les nouvelles colonnes
ALTER TABLE public.abonnements 
ADD COLUMN mois_abonnement INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
ADD COLUMN annee_abonnement INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Modifier les colonnes existantes pour les rendre optionnelles/obligatoires selon les besoins
ALTER TABLE public.abonnements 
ALTER COLUMN client_tel DROP NOT NULL;

-- Mettre à jour la fonction pour générer les réservations mensuelles
CREATE OR REPLACE FUNCTION public.generer_reservations_mensuelles(
  p_abonnement_id INTEGER,
  p_terrain_id INTEGER,
  p_mois INTEGER,
  p_annee INTEGER,
  p_jour_semaine INTEGER,
  p_heure TEXT,
  p_client_nom TEXT,
  p_client_tel TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
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
      1.5, 
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
$$;
