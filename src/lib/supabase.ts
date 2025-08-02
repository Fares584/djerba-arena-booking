
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
  client_nom: string;
  client_tel?: string | null;
  mois_abonnement: number;
  annee_abonnement: number;
  statut: 'actif' | 'expire' | 'annule';
  created_at?: string;
  updated_at?: string;
  terrain_id?: number | null;
  jour_semaine?: number | null; // 0=Dimanche, 1=Lundi, etc.
  heure_fixe?: string | null; // Format HH:MM
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
// Refactored to handle football terrains with fixed pricing for 1h30 sessions
export const calculatePrice = (terrain: Terrain, time: string, globalNightStartTime?: string): number => {
  const night = isNightTime(time, globalNightStartTime);

  // Specific football types based on 'nom' - FIXED PRICING FOR 1H30
  if (terrain.type === 'foot') {
    if (/6/.test(terrain.nom)) {
      return night ? 60 : 50; // 6v6 - tarif fixe pour 1h30
    }
    if (/7/.test(terrain.nom)) {
      return night ? 96 : 84; // 7v7 - tarif fixe pour 1h30
    }
    if (/8/.test(terrain.nom)) {
      return night ? 110 : 96; // 8v8 - tarif fixe pour 1h30
    }
    // Default foot pricing fallback - tarif fixe pour 1h30
    return night ? 65 : 60;
  }

  // Tennis Green Set types based on 'nom' - HOURLY PRICING
  if (terrain.type === 'tennis') {
    if (/green set/i.test(terrain.nom)) {
      // Tennis Green Set distinguished by 'autre' in name
      if (/autre/i.test(terrain.nom)) {
        return night ? 10 : 7.5;
      }
      return night ? 12.5 : 10;
    }
    // Fallback default if needed for classic tennis
    return night ? (terrain.prix_nuit || 30) : terrain.prix;
  }

  // Padel - HOURLY PRICING
  if (terrain.type === 'padel') {
    return night ? 80 : 60; // 60/80 DT per hour for 4 joueurs
  }
  
  // Fallback to generic logic
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

// Helper function to get month name in French
export const getMonthName = (monthNumber: number): string => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthNumber - 1] || '';
};

// Re-export the supabase client for backward compatibility
export { supabase };
