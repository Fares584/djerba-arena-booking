-- Activer la réplication pour les mises à jour en temps réel
ALTER TABLE reservations REPLICA IDENTITY FULL;

-- Ajouter la table à la publication pour les mises à jour en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;