import { supabase } from '@/integrations/supabase/client';

// Define types for our database
export type Terrain = {
  id: number;
  nom: string;
  type: 'foot' | 'tennis' | 'padel';
  capacite: number;
  prix: number;
  prix_nuit?: number; // Add night pricing
  heure_debut_nuit?: string; // Add configurable night time start
  image_url: string | null;
  actif: boolean;
  created_at?: string;
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
  remarque?: string | null;
  created_at?: string;
  updated_at?: string;
  abonnement_id?: number | null;
};

export type AbonnementType = {
  id: number;
  nom: string;
  description?: string | null;
  duree_mois: number;
  prix: number;
  reduction_pourcentage?: number | null;
  reservations_incluses?: number | null;
  actif: boolean;
  created_at?: string;
};

export type Abonnement = {
  id: number;
  abonnement_type_id: number;
  client_nom: string;
  client_email: string;
  client_tel: string;
  date_debut: string;
  date_fin: string;
  statut: 'actif' | 'expire' | 'annule';
  reservations_utilisees?: number | null;
  created_at?: string;
  updated_at?: string;
  terrain_id?: number | null;
  jour_semaine?: number | null; // 0=Dimanche, 1=Lundi, etc.
  heure_fixe?: string | null; // Format HH:MM
  duree_seance?: number | null; // Durée en heures
};

export type AdminUser = {
  id: string;
  email: string;
  created_at?: string;
};

// Utility function to determine if a time slot is night time (configurable per terrain)
export const isNightTime = (time: string, nightStartTime?: string): boolean => {
  const hour = parseInt(time.split(':')[0]);
  const nightHour = nightStartTime ? parseInt(nightStartTime.split(':')[0]) : 19;
  return hour >= nightHour;
};

// Function to calculate the price based on terrain and time
export const calculatePrice = (terrain: Terrain, time: string): number => {
  if (isNightTime(time, terrain.heure_debut_nuit) && terrain.prix_nuit) {
    return terrain.prix_nuit;
  }
  return terrain.prix;
};

// Helper function to get day name in French
export const getDayName = (dayNumber: number): string => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayNumber] || '';
};

// Re-export the supabase client for backward compatibility
export { supabase };
