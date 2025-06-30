
-- Activer RLS sur la table push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre à tous les utilisateurs authentifiés de gérer leurs propres abonnements
-- Pour les notifications push, on peut permettre l'insertion sans restriction car c'est pour les admins
CREATE POLICY "Anyone can subscribe to push notifications" 
ON public.push_subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Permettre à tous de voir les abonnements (nécessaire pour l'envoi des notifications)
CREATE POLICY "Anyone can view push subscriptions" 
ON public.push_subscriptions 
FOR SELECT 
USING (true);

-- Permettre la suppression des abonnements (pour se désabonner)
CREATE POLICY "Anyone can delete push subscriptions" 
ON public.push_subscriptions 
FOR DELETE 
USING (true);

-- Permettre la mise à jour des abonnements
CREATE POLICY "Anyone can update push subscriptions" 
ON public.push_subscriptions 
FOR UPDATE 
USING (true);
