
-- Insérer le paramètre de sécurité dans la table app_settings s'il n'existe pas déjà
INSERT INTO public.app_settings (setting_name, setting_value, created_at, updated_at)
VALUES ('security_limits_enabled', 'false', now(), now())
ON CONFLICT (setting_name) DO NOTHING;
