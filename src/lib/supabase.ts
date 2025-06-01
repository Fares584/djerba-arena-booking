
import { supabase } from '@/integrations/supabase/client';

// Define types for our database
export type Terrain = {
  id: number;
  nom: string;
  type: 'foot' | 'tennis' | 'padel';
  capacite: number;
  prix: number;
  image_url: string;
  actif: boolean;
};

export type Reservation = {
  id: number;
  nom_client: string;
  tel: string;
  email: string;
  terrain_id: number;
  date: string;
  heure: string;
  duree: number;
  statut: 'en_attente' | 'confirmee' | 'annulee';
  remarque?: string;
  created_at?: string;
  abonnement_id?: number;
};

export type AbonnementType = {
  id: number;
  nom: string;
  description?: string;
  duree_mois: number;
  prix: number;
  reduction_pourcentage: number;
  reservations_incluses: number;
  actif: boolean;
  created_at?: string;
};

export type Abonnement = {
  id: number;
  client_nom: string;
  client_email: string;
  client_tel: string;
  abonnement_type_id: number;
  date_debut: string;
  date_fin: string;
  statut: 'actif' | 'expire' | 'suspendu' | 'annule';
  reservations_utilisees: number;
  created_at?: string;
  updated_at?: string;
};

export type AdminUser = {
  id: string;
  email: string;
  // Note: password_hash is handled by Supabase Auth and not directly accessible
};

// Re-export the supabase client for backward compatibility
export { supabase };
