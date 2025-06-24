
-- Créer une table pour les rôles d'utilisateurs
CREATE TABLE IF NOT EXISTS public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Activer RLS sur la table user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leur propre rôle
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les admins puissent gérer tous les rôles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
));

-- Fonction pour vérifier si un utilisateur a un rôle spécifique
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = role_name
  );
$$;

-- Créer les comptes employés avec des mots de passe temporaires
-- Note: Ces utilisateurs devront confirmer leur email pour se connecter

-- Insérer les utilisateurs dans auth.users (simulation - en réalité ils s'inscriront)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'ahmed@planetsports.com',
  crypt('Ahmed123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'wassim@planetsports.com',
  crypt('Wassim123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'khalil@planetsports.com',
  crypt('Khalil123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Ajouter les rôles admin aux utilisateurs existants dans admin_users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM public.admin_users
ON CONFLICT (user_id, role) DO NOTHING;

-- Ajouter les rôles employés pour les nouveaux comptes
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'employee' FROM auth.users 
WHERE email IN ('ahmed@planetsports.com', 'wassim@planetsports.com', 'khalil@planetsports.com')
ON CONFLICT (user_id, role) DO NOTHING;
