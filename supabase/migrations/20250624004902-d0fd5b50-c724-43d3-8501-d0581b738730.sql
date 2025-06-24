
-- Créer une table pour la blacklist
CREATE TABLE public.blacklist (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('phone', 'email')),
  value VARCHAR(255) NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(type, value)
);

-- Activer RLS sur la table blacklist
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de gérer la blacklist
CREATE POLICY "Admins can manage blacklist" ON public.blacklist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

-- Ajouter un index pour les recherches rapides
CREATE INDEX idx_blacklist_type_value ON public.blacklist(type, value);

-- Ajouter une colonne pour traquer le dernier timestamp de réservation par IP/session
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT;
