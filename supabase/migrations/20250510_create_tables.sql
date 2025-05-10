
-- Create terrains table
CREATE TABLE IF NOT EXISTS public.terrains (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('foot', 'tennis', 'padel')),
  capacite INTEGER NOT NULL,
  prix NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  actif BOOLEAN DEFAULT true
);

-- Create reservations table
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_users table (this will work alongside Supabase Auth)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL
);

-- Insert sample data for testing
INSERT INTO public.terrains (nom, type, capacite, prix, image_url, actif)
VALUES 
('Terrain Foot 1', 'foot', 22, 120, 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80', true),
('Terrain Tennis Centre', 'tennis', 4, 60, 'https://images.unsplash.com/photo-1533123883-3d19f9aae294?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', true),
('Terrain Padel 1', 'padel', 4, 80, 'https://images.unsplash.com/photo-1554226714-4c6b35448600?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', true),
('Terrain Foot 2', 'foot', 10, 80, 'https://images.unsplash.com/photo-1618073193718-23a66109f4e6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80', false);
