-- Mettre à jour le mot de passe administrateur
-- Supprimer l'utilisateur admin existant s'il existe
DELETE FROM auth.users WHERE email = 'mohsen@gmail.com';

-- Créer un nouvel utilisateur admin avec le mot de passe "2341"
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
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'mohsen@gmail.com',
  crypt('2341', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- S'assurer que l'utilisateur admin a le rôle approprié dans la table admin_users
INSERT INTO public.admin_users (id, email, created_at)
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'mohsen@gmail.com'
ON CONFLICT (id) DO NOTHING;