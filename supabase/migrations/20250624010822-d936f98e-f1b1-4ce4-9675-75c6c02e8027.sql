
-- Changer le type de la colonne ip_address de INET vers TEXT
-- car nous stockons un identifiant de session, pas une vraie adresse IP
ALTER TABLE public.reservations 
ALTER COLUMN ip_address TYPE TEXT;
