
-- Add "montant" field to abonnements table for storing the price at creation
ALTER TABLE public.abonnements
ADD COLUMN montant numeric NULL;
