
import { supabase } from '@/integrations/supabase/client';

// Define types for our database
export type Terrain = {
  id: number;
  nom: string;
  type: 'foot' | 'tennis' | 'padel';
  capacite: number;
  prix: number;
  prix_nuit?: number; // Add night pricing
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

export type AppSetting = {
  id: number;
  setting_name: string;
  setting_value: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

// Utility function to determine if a time slot is night time (using global setting)
export const isNightTime = (time: string, globalNightStartTime?: string): boolean => {
  const hour = parseInt(time.split(':')[0]);
  const nightHour = globalNightStartTime ? parseInt(globalNightStartTime.split(':')[0]) : 19;
  return hour >= nightHour;
};

// Function to calculate the price based on terrain and time (using global night time setting)
export const calculatePrice = (terrain: Terrain, time: string, globalNightStartTime?: string): number => {
  if (isNightTime(time, globalNightStartTime) && terrain.prix_nuit) {
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
