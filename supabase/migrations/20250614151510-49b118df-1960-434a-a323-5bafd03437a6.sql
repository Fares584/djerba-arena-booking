
-- Ajout d'un token de confirmation et du statut de confirmation utilisateur aux réservations
ALTER TABLE public.reservations
ADD COLUMN confirmation_token TEXT,
ADD COLUMN confirmed_by_user BOOLEAN DEFAULT FALSE;

-- Index pour recherche rapide du token
CREATE INDEX IF NOT EXISTS reservations_confirmation_token_idx ON public.reservations (confirmation_token);
