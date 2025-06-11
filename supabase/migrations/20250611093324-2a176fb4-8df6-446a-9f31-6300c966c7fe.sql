
-- Créer la table des terrains
CREATE TABLE IF NOT EXISTS public.terrains (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('foot', 'tennis', 'padel')),
  capacite INTEGER NOT NULL,
  prix NUMERIC(10, 2) NOT NULL,
  prix_nuit NUMERIC(10, 2), -- Prix pour les créneaux de nuit (19h et après)
  image_url TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table des réservations
CREATE TABLE IF NOT EXISTS public.reservations (
  id SERIAL PRIMARY KEY,
  nom_client TEXT NOT NULL,
  tel TEXT NOT NULL,
  email TEXT NOT NULL,
  terrain_id INTEGER REFERENCES public.terrains(id) NOT NULL,
  date DATE NOT NULL,
  heure TEXT NOT NULL,
  duree NUMERIC(3, 1) NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('en_attente', 'confirmee', 'annulee')),
  remarque TEXT,
  abonnement_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table des types d'abonnements
CREATE TABLE IF NOT EXISTS public.abonnement_types (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  duree_mois INTEGER NOT NULL,
  prix NUMERIC(10, 2) NOT NULL,
  reduction_pourcentage NUMERIC(5, 2),
  reservations_incluses INTEGER,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table des abonnements
CREATE TABLE IF NOT EXISTS public.abonnements (
  id SERIAL PRIMARY KEY,
  abonnement_type_id INTEGER REFERENCES public.abonnement_types(id) NOT NULL,
  client_nom TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_tel TEXT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('actif', 'expire', 'annule')),
  reservations_utilisees INTEGER DEFAULT 0,
  terrain_id INTEGER REFERENCES public.terrains(id),
  jour_semaine INTEGER CHECK (jour_semaine BETWEEN 0 AND 6), -- 0=Dimanche, 1=Lundi, etc.
  heure_fixe TEXT, -- Format HH:MM
  duree_seance NUMERIC(3, 1), -- Durée en heures
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table des utilisateurs admin (liée à Supabase Auth)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter la contrainte de clé étrangère pour les abonnements dans les réservations
ALTER TABLE public.reservations 
ADD CONSTRAINT fk_abonnement 
FOREIGN KEY (abonnement_id) REFERENCES public.abonnements(id) ON DELETE SET NULL;

-- Activer RLS sur toutes les tables
ALTER TABLE public.terrains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonnement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonnements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les terrains (lecture publique, écriture pour les admins)
CREATE POLICY "Terrains lisibles par tous" ON public.terrains FOR SELECT USING (true);
CREATE POLICY "Terrains modifiables par les admins" ON public.terrains FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Politiques RLS pour les réservations (lecture par tous, écriture par tous pour les nouvelles réservations)
CREATE POLICY "Réservations lisibles par tous" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "Création de réservations par tous" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Réservations modifiables par les admins" ON public.reservations FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Réservations supprimables par les admins" ON public.reservations FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Politiques RLS pour les types d'abonnements
CREATE POLICY "Types d'abonnements lisibles par tous" ON public.abonnement_types FOR SELECT USING (true);
CREATE POLICY "Types d'abonnements modifiables par les admins" ON public.abonnement_types FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Politiques RLS pour les abonnements
CREATE POLICY "Abonnements lisibles par tous" ON public.abonnements FOR SELECT USING (true);
CREATE POLICY "Abonnements créables par tous" ON public.abonnements FOR INSERT WITH CHECK (true);
CREATE POLICY "Abonnements modifiables par les admins" ON public.abonnements FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Abonnements supprimables par les admins" ON public.abonnements FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Politiques RLS pour les admin_users
CREATE POLICY "Admin users lisibles par les admins" ON public.admin_users FOR SELECT 
USING (auth.uid() = id);
CREATE POLICY "Admin users modifiables par les admins" ON public.admin_users FOR ALL 
USING (auth.uid() = id);

-- Fonction pour générer les réservations récurrentes d'un abonnement
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
  -- Calculer le premier jour correspondant au jour de la semaine souhaité
  target_date := p_date_debut;
  days_to_add := (p_jour_semaine - EXTRACT(dow FROM target_date)::INTEGER) % 7;
  IF days_to_add < 0 THEN
    days_to_add := days_to_add + 7;
  END IF;
  target_date := target_date + days_to_add;
  
  -- Générer les réservations pour chaque semaine
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

-- Insérer des données d'exemple pour les terrains
INSERT INTO public.terrains (nom, type, capacite, prix, prix_nuit, image_url, actif)
VALUES 
('Terrain Foot 1', 'foot', 22, 120, 150, 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80', true),
('Terrain Tennis Centre', 'tennis', 4, 60, 80, 'https://images.unsplash.com/photo-1533123883-3d19f9aae294?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', true),
('Terrain Padel 1', 'padel', 4, 80, 100, 'https://images.unsplash.com/photo-1554226714-4c6b35448600?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', true),
('Terrain Foot 2', 'foot', 10, 80, 100, 'https://images.unsplash.com/photo-1618073193718-23a66109f4e6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80', false);

-- Insérer des types d'abonnements d'exemple
INSERT INTO public.abonnement_types (nom, description, duree_mois, prix, reduction_pourcentage, reservations_incluses, actif)
VALUES 
('Abonnement Mensuel Football', 'Accès illimité aux terrains de football pendant un mois', 1, 300, 15, 8, true),
('Abonnement Trimestriel Tennis', 'Accès privilégié aux courts de tennis pour 3 mois', 3, 450, 20, 12, true),
('Abonnement Annuel Padel', 'Abonnement annuel pour les terrains de padel', 12, 1200, 25, 48, true);
